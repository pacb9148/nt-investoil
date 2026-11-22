# dxf-cad reference

Deep reference for the `dxf-cad` skill: the JSON spec schema, a full annotated
example, ezdxf fundamentals, and DXF tips for laser cutting / CNC.

---

## 1. Spec schema (`dxf_write.py --spec`)

The spec is a single JSON object.

| Field        | Type   | Default  | Notes |
|--------------|--------|----------|-------|
| `name`       | string | `drawing`| Output file is `<name>.dxf`. |
| `dxfversion` | string | `R2018`  | Any ezdxf version tag: `R12`, `R2000`, `R2004`, `R2007`, `R2010`, `R2013`, `R2018`. |
| `units`      | string | `mm`     | One of `mm`, `cm`, `m`, `in`. Sets the header `$INSUNITS`. |
| `layers`     | array  | `[]`     | Layer definitions (see below). |
| `entities`   | array  | `[]`     | Drawing entities (see below). |
| `dimensions` | array  | `[]`     | Optional linear/aligned dimensions. |
| `hatches`    | array  | `[]`     | Optional filled regions. |

### Layers
```json
{ "name": "OUTLINE", "color": 7, "linetype": "CONTINUOUS" }
```
- `name` (required) - layer name.
- `color` - AutoCAD Color Index (ACI). Common: 1=red, 2=yellow, 3=green, 4=cyan, 5=blue, 6=magenta, 7=white/black, 8=dark gray.
- `linetype` - a standard linetype registered when the doc is created with `setup=True` (e.g. `CONTINUOUS`, `DASHED`, `CENTER`, `DASHDOT`).

### Entities
Every entity may carry `layer` and an optional per-entity `color` override.

| `type`       | Required fields | Optional fields |
|--------------|-----------------|-----------------|
| `line`       | `start` `[x,y]`, `end` `[x,y]` | |
| `circle`     | `center` `[x,y]`, `radius` | |
| `arc`        | `center`, `radius`, `start_angle`, `end_angle` (degrees, CCW) | |
| `lwpolyline` | `points` (list of `[x,y]` or `[x,y,bulge]`) | `closed` (bool) |
| `text`       | `text`, `insert` `[x,y]` | `height` (def 2.5), `rotation` (deg) |
| `mtext`      | `text`, `insert` `[x,y]` | `height` (def 2.5), `width` |
| `ellipse`    | `center` | `major_axis` `[x,y,z]` (def `[1,0,0]`), `ratio` (def 0.5), `start_param`, `end_param` (radians) |
| `point`      | `location` `[x,y]` | |

**Bulge** (the optional 3rd value of an `lwpolyline` vertex) defines the arc
from that vertex to the next: `bulge = tan(theta/4)` where `theta` is the
included arc angle. `1.0` -> 180 degree semicircle; `0` -> straight segment.

### Dimensions
```json
{ "type": "linear", "layer": "DIMENSIONS", "p1": [0,0], "p2": [120,0], "distance": -12, "angle": 0 }
```
- `type` - `linear` (axis-aligned, controlled by `angle` in degrees) or `aligned` (parallel to p1->p2).
- `p1`, `p2` - the two measured points.
- For `linear`: either give `base` `[x,y]` (the dimension-line location) directly, or give a signed `distance` (offset of the dim line from the p1-p2 midpoint, perpendicular to `angle`).
- For `aligned`: `distance` is the offset of the dimension line from the measured segment.

### Hatches
```json
{ "layer": "OUTLINE", "color": 8, "pattern": "SOLID",
  "paths": [[[88,56],[104,56],[104,72],[88,72]]] }
```
- `pattern` - `SOLID` for a solid fill, or a pattern name (e.g. `ANSI31`) with optional `scale`.
- `paths` - list of closed boundary loops; each loop is a list of `[x,y]` vertices.

---

## 2. Full annotated example

`examples/plate.json` builds a 120x80 mm aluminium plate: a closed outline,
four mounting holes, a rounded-end slot (via bulge), a text label, two linear
dimensions and one aligned dimension on a `DIMENSIONS` layer, and a small solid
hatch. Run it:

```bash
python scripts/dxf_write.py --spec examples/plate.json --out ./cad-output
python scripts/dxf_read.py  --file ./cad-output/plate.dxf --out ./cad-output
```

---

## 3. ezdxf basics

```python
import ezdxf
doc = ezdxf.new("R2018", setup=True)   # setup=True registers standard linetypes & text styles
from ezdxf import units
doc.units = units.MM                     # set drawing units (sets $INSUNITS)
msp = doc.modelspace()                   # the modelspace layout you draw into

doc.layers.add("CUT", color=1, linetype="CONTINUOUS")

msp.add_line((0, 0), (10, 0), dxfattribs={"layer": "CUT"})
msp.add_circle((5, 5), 2, dxfattribs={"layer": "CUT"})
msp.add_arc((0, 0), 5, start_angle=0, end_angle=90)
poly = msp.add_lwpolyline([(0, 0), (10, 0, 1.0), (10, 10), (0, 10)])
poly.close(True)
msp.add_text("LABEL", height=2.5).set_placement((1, 12))

dim = msp.add_linear_dim(base=(0, -10), p1=(0, 0), p2=(10, 0))
dim.render()                              # IMPORTANT: render() builds the dim geometry

doc.saveas("drawing.dxf")
```

**Reading & previewing:**
```python
import ezdxf
from ezdxf import bbox
from ezdxf.addons.drawing import RenderContext, Frontend
from ezdxf.addons.drawing.matplotlib import MatplotlibBackend

doc = ezdxf.readfile("drawing.dxf")
msp = doc.modelspace()
units_code = doc.header.get("$INSUNITS", 0)     # 4 == mm
extents = bbox.extents(msp)                       # .extmin / .extmax
```
`$INSUNITS` codes: `0` unitless, `1` inch, `2` foot, `4` mm, `5` cm, `6` m.

---

## 4. DXF tips for laser cutting / CNC

- **Use millimeters.** Almost every laser/CNC CAM tool expects mm; `units: "mm"` (the default) sets `$INSUNITS=4` so importers scale correctly. Mixing inches and mm is the #1 cause of 25.4x-scaled parts.
- **Close every cut loop.** Open polylines produce incomplete toolpaths or refuse to cut. Set `"closed": true` on outlines, holes, and slots. Circles and full ellipses are inherently closed.
- **One layer per operation.** Map layers to machine functions: `CUT` (through), `ENGRAVE`/`SCORE` (raster/low-power), `OUTLINE`, `HOLES`. Most CAM software assigns power/speed/tool per layer. Keep annotation layers (`DIMENSIONS`, `TEXT`) separate - they are reference only and should NOT be cut.
- **Color-code by intent.** Many lightweight cutter drivers (e.g. older LaserCut, RDWorks) key off ACI color, not layer. Assign distinct colors per operation as a fallback.
- **Vector text vs. engraving.** Standard `TEXT`/`MTEXT` are font references, not outlines; a cutter may not reproduce them. For engraved/cut lettering, convert to polylines/curves in CAD, or treat text as raster-engrave only.
- **Keep arcs as arcs.** Native `arc`/`circle`/bulge segments give smoother CNC motion than many short line segments. Use bulge in `lwpolyline` for filleted corners and slot ends.
- **No self-intersections / duplicates.** Overlapping or doubled geometry causes double-cutting and burn-through. Inspect with `dxf_read.py` (entity counts + extents) before sending to the machine.
- **DXF, not DWG.** ezdxf writes DXF (ASCII/interchange). If a tool insists on DWG, import the DXF and re-save, or use an external DWG converter; ezdxf does not emit native DWG.
- **R2018 is broadly compatible.** If a legacy importer chokes, drop `dxfversion` to `R2000` or `R12` (note: `R12` lacks `LWPOLYLINE`/`MTEXT`/modern dimensions - ezdxf will adapt where possible).
