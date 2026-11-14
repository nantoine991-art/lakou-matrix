# Lakou Matrix: physical magnet model

A tabletop version of the Lakou Matrix that behaves like the website. Its geometry comes from the same drawing: **1 unit on screen = 0.0192"** (the culture orbit of 430 units = 8.25" radius). Points on the model and points on screen sit in the same places.

Approximate overall size: **19.2" diameter**, about 1¼" tall.

## How each part of the system becomes physical

| On screen | In the model | Why it works |
|---|---|---|
| **Ayiti core** (the attractor) | A raised 3-layer core disc with a **25 × 10 mm N52 magnet** inside | Steel tokens and the visitor wand feel the pull near the center |
| **Spokes / lenses** | Engraved lines on the inner disc, lens names engraved | Same angles as the website |
| **Shells 1–3** | Three **curved slots** per spoke, cut through the inner disc over a steel layer | A charge point *snaps into* a shell and can't rest between shells. That's the discrete-shell rule made physical |
| **Charge points** | 1" acrylic **tokens in the culture's color**, each with a 6 × 3 mm magnet underneath | Pull one out and drop it in another slot to change its shell or lens, the same as dragging on the site |
| **Threads** | **Elastic cord** (0.8 mm) from the culture puck's eyelet to the token's eyelet | Tension is visible: the threads stretch when the ring turns |
| **Outer orbit / cultures** | A **rotating outer ring** with a compass in degrees; **culture pucks** sized by population | Turning the ring is momentum. Pucks sit at their real bearing (from QGIS) using the degree marks |
| **No population data yet** | A **ring puck** (with a hole) instead of a solid one | Same as the dashed outline on screen |
| **Cursor gravity** | A **visitor wand**: a magnet in a dowel | Hover over the board and tokens lean or lift toward it, then settle back into their slots |
| **An overlap's own orbit** | Small **photo tokens** on magnets placed around a charge point | Photos cluster around the point like the zoom view |
| **Visitor submissions → review** | A tray of **blank tokens and cards**. Visitors write an overlap and leave it in a "Submitted" tray. You or Jennifer place approved ones on the board and enter them in Notion | The same approve step as the site |

## Layers, bottom to top

1. **Base:** ¾" plywood disc, 20" diameter (or two layers of ½" MDF).
2. **Glides:** 6 **ball-transfer units** (½" ball), screwed into the base on a 8.7" radius circle, so the outer ring spins freely. Sheet B marks three glide positions per half.
3. **Steel layer:**
   - **under the inner disc:** a 15" disc of **adhesive ferrous sheet** (sold as "magnetic receptive sheet," cuts with scissors) or 24-gauge galvanized steel
   - **under the outer ring:** a 19" outer / 15.6" inner ring of the same, so culture pucks stay where you put them
4. **Spacer:** ⅛" hardboard under the inner disc so it sits level with the ring.
5. **Inner disc (Sheet A):** ⅛" (3 mm) Baltic birch or MDF, 15.2" diameter. Includes the spokes, lens names, shell rings and 27 shell slots (6.6 mm wide, 1.25" long).
6. **Outer ring (Sheet B):** ⅛" plywood in two halves (each about 19.2" × 9.6"), which fits an 18 × 24 laser bed one half at a time. A compass with 5° ticks and labels every 45°. Glue the halves to a thin ring of hardboard underneath, or join them with two splice plates.
7. **Core (Sheet C):** three 2.4" discs. Two have the 25 mm magnet hole, and the top one is engraved "AYITI". Glue the stack in the center over the core magnet hole in the inner disc.
8. **Pucks and tokens (Sheet C):** colored acrylic. 12 culture pucks, each with a 10 × 3 mm magnet (no hole needed); 48 charge-point tokens, each with a 6 × 3 mm magnet. Each piece has a small eyelet hole for the cord.

## Laser files

All three sheets are SVG at true size in inches. Check the scale on import (the inner disc must measure 15.2").

| Color | Operation |
|---|---|
| Red hairline | Cut |
| Blue hairline | Vector engrave or score |
| Black fill | Raster engrave (text) |

- `A_inner_disc_lenses_shells.svg`: inner disc (one ⅛" sheet)
- `B_outer_orbit_ring_halves.svg`: outer ring, two halves (cut each half on its own)
- `C_core_pucks_tokens.svg`: core discs, 12 culture pucks, 48 tokens (colored acrylic for pucks and tokens; cut the core from wood)
- `make_model_sheets.py`: regenerates the sheets if lenses, cultures or populations change

**The puck sizes are placeholders** until the QGIS population numbers are in. Re-run the script and re-cut the pucks then.

## Parts list (approximate)

| Item | Qty | Notes |
|---|---|---|
| ⅛" Baltic birch or MDF, 18 × 24 | 3 sheets | Inner disc, two ring halves, core |
| ⅛" acrylic in palette colors | offcuts | Teal, deep teal, green, vermilion, marigold, slate, plus 2–3 extra shades |
| ¾" plywood | 20" disc | Base |
| Adhesive ferrous sheet | ~2 sq ft | Steel layer |
| N52 magnets 6 × 3 mm | 50 | Charge-point tokens |
| N52 magnets 10 × 3 mm | 14 | Culture pucks + spares |
| N52 magnet 25 × 10 mm | 2 | Core + visitor wand |
| Ball-transfer units, ½" | 6 | Ring rotation |
| Elastic cord 0.8 mm | 10 m | Threads; color with markers to match cultures |
| ½" dowel, 8" | 1 | Visitor wand |
| Hardboard ⅛" | 1 sheet | Spacer, ring backer |

## Build order

1. Cut and engrave sheets A and B. Dry-fit them on the base with the steel layer, and check that the ring spins on the glides.
2. Glue the core stack, with the core magnet sitting in the hole.
3. Cut sheet C in colored acrylic. Glue the magnets **all facing the same way**: test each one against the steel before the glue sets.
4. Place cultures at their bearings using the ring's degree marks (even spacing until the QGIS data exists).
5. Place tokens into slots following the website, matching shell and lens. Tie cord from each culture's eyelet to its tokens.
6. Photograph the model from directly above. That photo can go on the poster next to the screen version.

## Safety at the poster session

N52 magnets pinch hard and are dangerous if swallowed. Keep loose tokens and the wand in a tray, supervise children, and keep the wand's magnet glued deep inside the dowel.
