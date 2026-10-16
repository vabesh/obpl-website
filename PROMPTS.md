# Orbit Beyond India — prompts for generating the home-page flight

Workflow: make one still per system (step 1), animate each still into a short clip (step 2),
export (step 3), send (step 4). Keep the STYLE BLOCK identical in every prompt so the seven shots
look like one place.

## STYLE BLOCK (paste at the end of every image prompt)

> Photorealistic, lunar south pole surface, grey regolith with fine dust and scattered angular
> boulders, low sun from the upper left casting long hard shadows, pure black sky, no atmosphere,
> no haze, no stars, faint sun flare at top left, neutral colour, cinematic wide lens, 16:9,
> high detail, NASA documentary photograph style. No text, no watermark, no people, no flags.

Branding note: image tools garble text. Ask for "a small white panel with a navy circular emblem"
instead of the words ORBIT BEYOND. Do not include the tagline.

## Step 1 — one still per system (16:9, highest resolution the tool offers)

1. VSAT (already done; reuse your existing render as the still)

2. Night survival unit
> A compact lunar night-survival unit on four short legs: a boxy white insulated module with gold
> multi-layer foil, a dark radiator fin array on top, two small radioisotope heater canisters on
> the side, a thick battery pack beneath, a small white panel with a navy circular emblem, sitting on
> grey regolith, three-quarter front view from slightly above. STYLE BLOCK

3. Rover
> A six-wheeled long-range lunar rover with metal mesh wheels, white body with gold foil panels, a
> mast with stereo cameras, a small dish antenna, a robotic arm folded at the front, a small white
> panel with a navy circular emblem, wheel tracks in the regolith behind it, three-quarter front
> view at low angle. STYLE BLOCK

4. Helium-3 extraction unit
> A tracked lunar regolith processing machine: a bucket-drum excavator at the front feeding a
> sealed heating chamber, pipes and a gas-collection tank behind, white and gold foil surfaces, a
> small white panel with a navy circular emblem, regolith piled beside it, three-quarter front view.
> STYLE BLOCK

5. OB1 lander
> A lunar lander on four legs with round footpads: an octagonal white body with gold foil, a
> cylindrical fuel tank visible, a single main engine nozzle beneath, a small dish antenna and two
> small solar panels on top, a small white panel with a navy circular emblem, landed on grey
> regolith with a small crater behind, three-quarter view from a low angle. STYLE BLOCK

6. Relay orbiter
> A communications relay satellite in orbit above the Moon: a box-shaped gold foil bus, two long
> solar panel wings, a large white dish antenna pointed at the camera, the curved grey lunar
> horizon at the bottom of frame with crater shadows, pure black sky above, sunlight from the upper
> left. No text, no watermark. Photorealistic, 16:9.

7. AI data centre
> A containerised lunar compute module: a long white insulated container on short legs, a tall wall
> of dark radiator fins along its roof, gold foil cable runs, a small dish antenna on one end, a few
> small blue status lights, a small white panel with a navy circular emblem, sitting on grey
> regolith with boulders, three-quarter front view. STYLE BLOCK

Tip: if one output drifts from the look of the VSAT still, generate again with the same prompt;
do not change the STYLE BLOCK to fix a single image.

## Step 2 — animate each still into a clip (image-to-video, 4 to 5 seconds)

Upload the still as the first frame. Use the same motion prompt for every system except the
orbiter:

> Slow cinematic camera: starts slightly higher and further back, glides smoothly down and forward
> toward the machine, then comes to a complete stop and holds perfectly still for the last two
> seconds. The machine does not move. Dust is still. No camera shake, no zoom pulsing, no cuts.

Orbiter motion prompt:
> Slow cinematic drift sideways past the satellite with the lunar horizon below, then the camera
> comes to a complete stop and holds perfectly still for the last two seconds. The satellite does
> not move. No cuts.

Opening shot (no still needed; text-to-video):
> Flying low and fast over the lunar south pole surface at sunrise, long shadows across craters and
> ridges, pure black sky, Earth small and low on the horizon, cinematic, photorealistic, 16:9, the
> camera gradually slowing down.

Closing shot (text-to-video):
> Rising slowly away from a small lunar outpost on grey regolith, the surface falling away below,
> the curved horizon and black sky, Earth low on the horizon, cinematic, photorealistic, 16:9.

Settings: 1920x1080 (or 4K if offered), 24 fps, the tool's highest quality, no motion-strength
above the default, no "loop" option.

## Step 3 — check each clip

- The last two seconds must be a still frame: the machine and the camera both frozen.
- The machine must look the same at the end as in the still (no morphing).
- No text or watermark. Reject and regenerate rather than crop.

## Step 4 — send

Nine MP4s named 00-opening, 01-vsat, 02-night, 03-rover, 04-extraction, 05-lander, 06-orbiter,
07-datacentre, 08-closing, plus the seven stills. The page is adapted to play the clips as
segments with a short transition between them, and the stills are reused in the detail drawers.
