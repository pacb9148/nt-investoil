---
name: dxf-cad
description: Headless DXF authoring and inspection with ezdxf (no AutoCAD needed). Use when the user wants to create, generate, edit, or inspect DXF drawings for AutoCAD interchange, laser cutting, CNC, or 2D CAD - e.g. build a DXF from a JSON spec (layers, lines, circles, arcs, lwpolylines with bulge, text/mtext, ellipses, points, linear/aligned dimensions, hatches), or read a .dxf to report units, layers, entity counts, bounding-box extents, and render a preview PNG.
---

Author and inspect AutoCAD-compatible DXF files in pure Python via ezdxf, with no AutoCAD or proprietary software required.

## When to use
- The user wants to **create a DXF** from parameters: plates, brackets, panels, gaskets, laser/CNC cut profiles.
- The user has a **JSON description** of 2D geometry (layers + entities + dimensions) and wants a `.dxf`.
- The user wants to **inspect an existing `.dxf`**: units, layers, entity counts by type, drawing extents, or a quick preview image.
- 2D interchange for **AutoCAD, LibreCAD, QCAD, laser cutters, CNC routers**.

## When NOT to use
- 3D solid modeling, meshes, or STEP/STL/GLB export -> use the `build123d` skill.
- Parametric scripted solids -> use the `openscad` skill.
- DWG (binary AutoCAD) read/write -> ezdxf does not handle native DWG; export DXF from the source app instead.

## How to use

Both scripts accept `--out <dir>` (default `./cad-output`, created automatically) and print a JSON summary to stdout (progress goes to stderr).

### 1. Write a DXF from a spec
**Claude Code / Desktop (plugin installed):**
```bash
uv run --python 3.12 --with ezdxf \
  "${CLAUDE_PLUGIN_ROOT}/skills/dxf-cad/scripts/dxf_write.py" \
  --spec "${CLAUDE_PLUGIN_ROOT}/skills/dxf-cad/examples/plate.json" --out ./cad-output
```
Built-in demo (no spec needed):
```bash
uv run --python 3.12 --with ezdxf \
  "${CLAUDE_PLUGIN_ROOT}/skills/dxf-cad/scripts/dxf_write.py" --demo --out ./cad-output
```
**Portable / Cowork sandbox (no uv):**
```bash
pip install ezdxf && python scripts/dxf_write.py --spec examples/plate.json --out ./cad-output
```

The spec is a JSON object with `name`, `dxfversion` (default `R2018`), `units` (default `mm`), `layers`, `entities`, and optional `dimensions` and `hatches`. See `examples/plate.json` and **reference.md** for the full schema.

### 2. Read / inspect a DXF (and render a preview PNG)
**Claude Code / Desktop:**
```bash
uv run --python 3.12 --with ezdxf --with matplotlib \
  "${CLAUDE_PLUGIN_ROOT}/skills/dxf-cad/scripts/dxf_read.py" \
  --file ./cad-output/plate.dxf --out ./cad-output
```
**Portable / Cowork sandbox:**
```bash
pip install ezdxf matplotlib && python scripts/dxf_read.py --file ./cad-output/plate.dxf --out ./cad-output
```
PNG preview renders by default when matplotlib is present. Disable it with `--no-png` (then ezdxf alone is enough).

## Outputs
- `dxf_write.py` -> a `<name>.dxf` file (DXF R2018 by default) in `--out`. JSON summary includes the absolute DXF path, layer list, and per-type entity counts.
- `dxf_read.py` -> a JSON summary (units, layers, entity counts, bounding-box extents) plus, by default, a `<name>_preview.png` in `--out`.

## Tips / gotchas
- **Units are mm** by default - correct for most laser/CNC workflows. The header `$INSUNITS` is set so downstream tools scale correctly.
- **Closed polylines for cut paths.** Laser/CNC software needs closed loops; set `"closed": true` on `lwpolyline` outlines and slots.
- **One layer per operation** (e.g. `CUT`, `ENGRAVE`, `OUTLINE`, `HOLES`) so the machine/operator can map each layer to a tool or power setting. The example uses `DIMENSIONS` for annotations (never sent to the cutter).
- **Bulge** on `lwpolyline` vertices creates arcs: bulge `1.0` is a 180 degree semicircle to the next vertex - handy for slot ends and rounded corners.
- **Dimensions** are exploded into block geometry via `render()`; they display in any DXF viewer without a dimension style engine.
- If matplotlib is unavailable the reader still prints its full JSON summary and just skips the PNG (no crash).

See **reference.md** for the complete spec schema, an annotated example, ezdxf basics (doc/modelspace, layers, entities, units, dimensions), and laser/CNC best practices.
