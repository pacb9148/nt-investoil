#!/usr/bin/env python3
"""Inspect a DXF file with ezdxf: units, layers, entity counts, extents, preview.

Reports header insertion units, the layer table, modelspace entity counts by
type, and the bounding-box extents. With --png (default on when matplotlib is
available) it renders a preview PNG via ezdxf.addons.drawing.matplotlib.

Examples
--------
  # Inspect and render a preview
  uv run --python 3.12 --with ezdxf --with matplotlib dxf_read.py --file drawing.dxf --out ./cad-output

  # Inspect without rendering a PNG
  uv run --python 3.12 --with ezdxf dxf_read.py --file drawing.dxf --no-png

  # Portable / sandbox invocation
  pip install ezdxf matplotlib && python scripts/dxf_read.py --file drawing.dxf
"""

import argparse
import json
import os
import sys


def log(msg):
    """Human-readable progress goes to stderr so stdout stays pure JSON."""
    print(msg, file=sys.stderr)


def fail(msg, code=1):
    """Fail loudly with an actionable message and a nonzero exit code."""
    print(f"ERROR: {msg}", file=sys.stderr)
    sys.exit(code)


# Map ezdxf $INSUNITS integer codes to human-readable names.
INSUNITS = {
    0: "unitless",
    1: "in",
    2: "ft",
    4: "mm",
    5: "cm",
    6: "m",
    9: "microns",
    10: "yd",
}


def compute_extents(msp, ezdxf):
    """Return (min, max) bounding box of modelspace, or None if unavailable."""
    try:
        from ezdxf import bbox

        cache = bbox.Cache()
        box = bbox.extents(msp, cache=cache)
        if box.has_data:
            return (
                [round(box.extmin.x, 6), round(box.extmin.y, 6), round(box.extmin.z, 6)],
                [round(box.extmax.x, 6), round(box.extmax.y, 6), round(box.extmax.z, 6)],
            )
    except Exception as exc:  # bbox can fail on exotic entities; degrade nicely
        log(f"WARNING: could not compute extents: {exc}")
    return None


def render_png(doc, png_path):
    """Render a preview PNG using the matplotlib drawing backend.

    Returns the path on success, or None (with a stderr warning) if matplotlib
    is not available.
    """
    try:
        import matplotlib

        matplotlib.use("Agg")  # headless backend, no display required
        import matplotlib.pyplot as plt
        from ezdxf.addons.drawing import RenderContext, Frontend
        from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    except ImportError:
        log(
            "WARNING: matplotlib not installed; skipping PNG preview. "
            "Install with: pip install matplotlib"
        )
        return None

    msp = doc.modelspace()
    fig = plt.figure()
    ax = fig.add_axes([0, 0, 1, 1])
    ctx = RenderContext(doc)
    backend = MatplotlibBackend(ax)
    Frontend(ctx, backend).draw_layout(msp, finalize=True)
    fig.savefig(png_path, dpi=150)
    plt.close(fig)
    return png_path


def main():
    parser = argparse.ArgumentParser(
        description="Inspect a DXF file with ezdxf and optionally render a preview PNG.",
        epilog=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--file", required=True, help="Path to the .dxf file to inspect.")
    parser.add_argument(
        "--out",
        default="./cad-output",
        help="Output directory for the preview PNG (created if missing). Default: ./cad-output",
    )
    png_group = parser.add_mutually_exclusive_group()
    png_group.add_argument(
        "--png",
        dest="png",
        action="store_true",
        default=None,
        help="Render a preview PNG (default on if matplotlib is available).",
    )
    png_group.add_argument(
        "--no-png",
        dest="png",
        action="store_false",
        help="Do not render a preview PNG.",
    )
    args = parser.parse_args()

    try:
        import ezdxf
    except ImportError:
        fail(
            "ezdxf is not installed. Install with:\n"
            "  pip install ezdxf\n"
            "or run via uv:\n"
            "  uv run --python 3.12 --with ezdxf --with matplotlib dxf_read.py ..."
        )

    if not os.path.isfile(args.file):
        fail(f"DXF file not found: {args.file}")

    log(f"Opening {args.file}...")
    try:
        doc = ezdxf.readfile(args.file)
    except IOError:
        fail(f"Could not read file (not found or not accessible): {args.file}")
    except ezdxf.DXFStructureError as exc:
        fail(f"Invalid or corrupt DXF file: {exc}")

    msp = doc.modelspace()

    # Header units.
    insunits = doc.header.get("$INSUNITS", 0)
    units_name = INSUNITS.get(insunits, f"code:{insunits}")

    # Layers.
    layers = []
    for layer in doc.layers:
        layers.append(
            {
                "name": layer.dxf.name,
                "color": layer.dxf.color,
                "linetype": layer.dxf.linetype,
            }
        )

    # Entity counts by DXF type.
    counts = {}
    for ent in msp:
        kind = ent.dxftype()
        counts[kind] = counts.get(kind, 0) + 1
    total = sum(counts.values())
    log(f"Found {total} modelspace entities across {len(counts)} types.")

    # Bounding box extents.
    extents = compute_extents(msp, ezdxf)

    # Optional PNG preview.
    out_dir = os.path.abspath(args.out)
    preview_path = None
    # Default: render unless explicitly disabled.
    want_png = True if args.png is None else args.png
    if want_png:
        os.makedirs(out_dir, exist_ok=True)
        base = os.path.splitext(os.path.basename(args.file))[0]
        target = os.path.join(out_dir, f"{base}_preview.png")
        log("Rendering preview PNG...")
        preview_path = render_png(doc, target)
        if preview_path:
            log(f"Saved preview {preview_path}")

    summary = {
        "file": os.path.abspath(args.file),
        "dxfversion": doc.dxfversion,
        "units": units_name,
        "insunits_code": insunits,
        "layers": layers,
        "layer_count": len(layers),
        "entity_counts": counts,
        "total_entities": total,
        "extents": {"min": extents[0], "max": extents[1]} if extents else None,
        "preview_png": os.path.abspath(preview_path) if preview_path else None,
    }
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
