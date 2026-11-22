#!/usr/bin/env python3
"""Build a DXF file from a JSON spec using ezdxf (no AutoCAD required).

The spec describes document units, layers, and entities (lines, circles,
arcs, lwpolylines with optional bulge, text/mtext, ellipses, points),
plus optional linear/aligned dimensions and a simple hatch.

Examples
--------
  # Build from a spec file
  uv run --python 3.12 --with ezdxf dxf_write.py --spec examples/plate.json --out ./cad-output

  # Generate a built-in demo drawing (no spec needed)
  uv run --python 3.12 --with ezdxf dxf_write.py --demo --out /tmp/dxf-smoke

  # Portable / sandbox invocation
  pip install ezdxf && python scripts/dxf_write.py --spec examples/plate.json
"""

import argparse
import json
import math
import os
import sys


def log(msg):
    """Human-readable progress goes to stderr so stdout stays pure JSON."""
    print(msg, file=sys.stderr)


def fail(msg, code=1):
    """Fail loudly with an actionable message and a nonzero exit code."""
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(code)


# ---------------------------------------------------------------------------
# Built-in demo spec: a rectangular plate with mounting holes, a slot and dims
# ---------------------------------------------------------------------------
def demo_spec():
    """Return a self-contained demo spec (mirrors examples/plate.json)."""
    return {
        "name": "demo_plate",
        "dxfversion": "R2018",
        "units": "mm",
        "layers": [
            {"name": "OUTLINE", "color": 7, "linetype": "CONTINUOUS"},
            {"name": "HOLES", "color": 1, "linetype": "CONTINUOUS"},
            {"name": "SLOTS", "color": 3, "linetype": "CONTINUOUS"},
            {"name": "DIMENSIONS", "color": 5, "linetype": "CONTINUOUS"},
            {"name": "TEXT", "color": 2, "linetype": "CONTINUOUS"},
        ],
        "entities": [
            # Plate outline 120 x 80, as a closed lwpolyline
            {
                "type": "lwpolyline",
                "layer": "OUTLINE",
                "closed": True,
                "points": [[0, 0], [120, 0], [120, 80], [0, 80]],
            },
            # Four mounting holes (radius 4) inset 12 from each corner
            {"type": "circle", "layer": "HOLES", "center": [12, 12], "radius": 4},
            {"type": "circle", "layer": "HOLES", "center": [108, 12], "radius": 4},
            {"type": "circle", "layer": "HOLES", "center": [108, 68], "radius": 4},
            {"type": "circle", "layer": "HOLES", "center": [12, 68], "radius": 4},
            # A slot built from a closed lwpolyline using bulge for the rounded ends
            {
                "type": "lwpolyline",
                "layer": "SLOTS",
                "closed": True,
                "points": [
                    [50, 35, 0],
                    [70, 35, 1.0],  # bulge=1 -> semicircle to next vertex
                    [70, 45, 0],
                    [50, 45, 1.0],  # bulge=1 -> semicircle back
                ],
            },
            # A label
            {
                "type": "text",
                "layer": "TEXT",
                "text": "PLATE 120x80",
                "insert": [4, 84],
                "height": 4,
            },
        ],
        "dimensions": [
            {
                "type": "linear",
                "layer": "DIMENSIONS",
                "p1": [0, 0],
                "p2": [120, 0],
                "distance": -12,
                "angle": 0,
            },
            {
                "type": "linear",
                "layer": "DIMENSIONS",
                "p1": [0, 0],
                "p2": [0, 80],
                "distance": -12,
                "angle": 90,
            },
        ],
        "hatches": [
            # Optional solid hatch demonstrating a simple filled boundary
            {
                "layer": "OUTLINE",
                "color": 8,
                "pattern": "SOLID",
                "paths": [[[88, 58], [104, 58], [104, 72], [88, 72]]],
            }
        ],
    }


# ---------------------------------------------------------------------------
# Spec -> DXF builder
# ---------------------------------------------------------------------------
def build_doc(spec, ezdxf):
    """Translate a validated spec dict into an ezdxf Drawing object."""
    from ezdxf import units as ezunits

    dxfversion = spec.get("dxfversion", "R2018")
    doc = ezdxf.new(dxfversion, setup=True)  # setup=True registers std linetypes

    # Document units. ezdxf exposes an enum of insertion units; mm is the
    # default for fabrication. We map a few common names defensively.
    unit_map = {
        "mm": ezunits.MM,
        "millimeter": ezunits.MM,
        "cm": ezunits.CM,
        "m": ezunits.M,
        "in": ezunits.IN,
        "inch": ezunits.IN,
    }
    unit_name = str(spec.get("units", "mm")).lower()
    doc.units = unit_map.get(unit_name, ezunits.MM)

    msp = doc.modelspace()
    counts = {}

    def bump(kind):
        counts[kind] = counts.get(kind, 0) + 1

    # --- Layers -------------------------------------------------------------
    for layer in spec.get("layers", []):
        name = layer["name"]
        attrs = {}
        if "color" in layer:
            attrs["color"] = int(layer["color"])
        if "linetype" in layer:
            attrs["linetype"] = layer["linetype"]
        if name not in doc.layers:
            doc.layers.add(name, **attrs)
        else:
            doc.layers.get(name).update_dxf_attribs(attrs)

    def common(ent):
        """Extract attribs shared by all entities (layer, color override)."""
        a = {}
        if "layer" in ent:
            a["layer"] = ent["layer"]
        if "color" in ent:
            a["color"] = int(ent["color"])
        return a

    # --- Entities -----------------------------------------------------------
    for ent in spec.get("entities", []):
        etype = ent.get("type", "").lower()
        attrs = common(ent)

        if etype == "line":
            msp.add_line(ent["start"], ent["end"], dxfattribs=attrs)
            bump("LINE")

        elif etype == "circle":
            msp.add_circle(ent["center"], float(ent["radius"]), dxfattribs=attrs)
            bump("CIRCLE")

        elif etype == "arc":
            msp.add_arc(
                center=ent["center"],
                radius=float(ent["radius"]),
                start_angle=float(ent["start_angle"]),
                end_angle=float(ent["end_angle"]),
                dxfattribs=attrs,
            )
            bump("ARC")

        elif etype == "lwpolyline":
            # Points may be [x, y] or [x, y, bulge]; ezdxf accepts that format.
            pts = ent["points"]
            poly = msp.add_lwpolyline(pts, dxfattribs=attrs)
            if ent.get("closed"):
                poly.close(True)
            bump("LWPOLYLINE")

        elif etype == "text":
            t = msp.add_text(
                ent["text"],
                height=float(ent.get("height", 2.5)),
                rotation=float(ent.get("rotation", 0)),
                dxfattribs=attrs,
            )
            t.set_placement(tuple(ent.get("insert", [0, 0])))
            bump("TEXT")

        elif etype == "mtext":
            m = msp.add_mtext(ent["text"], dxfattribs=attrs)
            m.set_location(tuple(ent.get("insert", [0, 0])))
            m.dxf.char_height = float(ent.get("height", 2.5))
            if "width" in ent:
                m.dxf.width = float(ent["width"])
            bump("MTEXT")

        elif etype == "ellipse":
            msp.add_ellipse(
                center=ent["center"],
                major_axis=ent.get("major_axis", [1, 0, 0]),
                ratio=float(ent.get("ratio", 0.5)),
                start_param=float(ent.get("start_param", 0)),
                end_param=float(ent.get("end_param", 2 * math.pi)),
                dxfattribs=attrs,
            )
            bump("ELLIPSE")

        elif etype == "point":
            msp.add_point(ent["location"], dxfattribs=attrs)
            bump("POINT")

        else:
            fail(f"Unknown entity type: {ent.get('type')!r}")

    # --- Dimensions ---------------------------------------------------------
    for dim in spec.get("dimensions", []):
        dtype = dim.get("type", "linear").lower()
        attrs = {}
        if "layer" in dim:
            attrs["layer"] = dim["layer"]

        if dtype == "linear":
            d = msp.add_linear_dim(
                base=_dim_base(dim),
                p1=tuple(dim["p1"]),
                p2=tuple(dim["p2"]),
                angle=float(dim.get("angle", 0)),
                dxfattribs=attrs,
            )
            d.render()  # build the dimension block geometry
            bump("DIMENSION")

        elif dtype == "aligned":
            d = msp.add_aligned_dim(
                p1=tuple(dim["p1"]),
                p2=tuple(dim["p2"]),
                distance=float(dim.get("distance", 10)),
                dxfattribs=attrs,
            )
            d.render()
            bump("DIMENSION")

        else:
            fail(f"Unknown dimension type: {dim.get('type')!r}")

    # --- Hatches ------------------------------------------------------------
    for h in spec.get("hatches", []):
        attrs = {}
        if "layer" in h:
            attrs["layer"] = h["layer"]
        if "color" in h:
            attrs["color"] = int(h["color"])
        hatch = msp.add_hatch(color=int(h.get("color", 7)), dxfattribs=attrs)
        pattern = h.get("pattern", "SOLID")
        if pattern.upper() != "SOLID":
            hatch.set_pattern_fill(pattern, scale=float(h.get("scale", 1.0)))
        for path in h.get("paths", []):
            # Each path is a closed list of [x, y] vertices.
            hatch.paths.add_polyline_path(path, is_closed=True)
        bump("HATCH")

    return doc, counts


def _dim_base(dim):
    """Compute the dimension line base point.

    If an explicit 'base' is given use it, otherwise offset the midpoint of
    p1->p2 by 'distance' perpendicular to the measured direction (a friendly
    shorthand so specs only need a signed distance).
    """
    if "base" in dim:
        return tuple(dim["base"])
    p1 = dim["p1"]
    p2 = dim["p2"]
    distance = float(dim.get("distance", -10))
    angle = math.radians(float(dim.get("angle", 0)))
    # Offset direction is perpendicular to the dimension's measuring angle.
    mid = ((p1[0] + p2[0]) / 2.0, (p1[1] + p2[1]) / 2.0)
    ox = -math.sin(angle) * distance
    oy = math.cos(angle) * distance
    return (mid[0] + ox, mid[1] + oy)


def main():
    parser = argparse.ArgumentParser(
        description="Build a DXF file from a JSON spec using ezdxf (no AutoCAD required).",
        epilog=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--spec", help="Path to the JSON spec file.")
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Generate a built-in demo plate drawing (no --spec needed).",
    )
    parser.add_argument(
        "--out",
        default="./cad-output",
        help="Output directory (created if missing). Default: ./cad-output",
    )
    args = parser.parse_args()

    if not args.spec and not args.demo:
        fail("Provide --spec <file.json> or --demo.")

    # Import ezdxf with a friendly error if it's missing.
    try:
        import ezdxf
    except ImportError:
        fail(
            "ezdxf is not installed. Install with:\n"
            "  pip install ezdxf\n"
            "or run via uv:\n"
            "  uv run --python 3.12 --with ezdxf dxf_write.py ..."
        )

    # Load the spec.
    if args.demo:
        spec = demo_spec()
        log("Using built-in demo spec.")
    else:
        if not os.path.isfile(args.spec):
            fail(f"Spec file not found: {args.spec}")
        try:
            with open(args.spec, "r", encoding="utf-8") as fh:
                spec = json.load(fh)
        except json.JSONDecodeError as exc:
            fail(f"Invalid JSON in spec {args.spec}: {exc}")

    out_dir = os.path.abspath(args.out)
    os.makedirs(out_dir, exist_ok=True)

    name = spec.get("name", "drawing")
    log(f"Building DXF '{name}' (version {spec.get('dxfversion', 'R2018')})...")

    try:
        doc, counts = build_doc(spec, ezdxf)
    except KeyError as exc:
        fail(f"Spec is missing a required field: {exc}")

    out_path = os.path.join(out_dir, f"{name}.dxf")
    doc.saveas(out_path)
    log(f"Saved {out_path}")

    total = sum(counts.values())
    summary = {
        "dxf": os.path.abspath(out_path),
        "name": name,
        "dxfversion": spec.get("dxfversion", "R2018"),
        "units": spec.get("units", "mm"),
        "layers": [layer["name"] for layer in spec.get("layers", [])],
        "entity_counts": counts,
        "total_entities": total,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
