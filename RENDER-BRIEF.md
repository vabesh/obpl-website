# Orbit Beyond India — render brief for the home-page flight

The home page plays a pre-rendered flight across the lunar south pole. Scrolling moves the camera
forwards and backwards through the flight; at each of the seven systems the camera settles and
holds, and the visitor can click the system to open its detail drawer. The page does not play the
flight as a video: it steps through individual frames, so it must be delivered as frames (or as a
video from which frames are extracted).

## The shot

One continuous camera move, no cuts, over the same terrain from start to end.

| # | Stop | What the camera settles on |
|---|------|----------------------------|
| 0 | Opening | High and wide over the surface, Earth low on the horizon, flying in |
| 1 | VSAT | Vertical solar array, deployed, three-quarter front view |
| 2 | Night survival | RHU / battery / Stirling night unit, radiator visible |
| 3 | Rover | Long-range rover, wheels on regolith, three-quarter view |
| 4 | Helium-3 extraction | Regolith processing unit, auger or intake visible |
| 5 | OB1 lander | Lander on its legs, three-quarter view, slightly low angle |
| 6 | Relay orbiter | Camera tilts up: orbiter against the black sky, surface at the bottom of frame |
| 7 | AI data centre | Containerised compute module with radiator wall |
| 8 | Closing | Camera pulls up and away, horizon and Earth |

Between stops the camera flies at altitude, 20 to 60 m above the ground, and comes down to settle
about 25 to 35 m from each system on its sunlit side. The flight can visit the systems in any
spatial layout you like; the page only needs them in this order.

## Holds

At each stop the camera must be completely still for at least 1 second (24 frames). The page
freezes on one frame inside that hold for as long as the visitor stays, so a still camera matters.
Nothing in the frame should move during the hold either, unless you also deliver a hold loop (see
below).

## Lighting and look

Same look as the VSAT reference render already supplied: low sun, long shadows, pure black sky,
neutral light-grey regolith, scattered boulders, sun flare allowed, no atmosphere or haze.
Earth may be visible low on the horizon. No text, logos or watermarks burned into the frames apart
from markings on the hardware itself. All hardware carries Orbit Beyond markings only; no partner
or agency logos.

## Delivery

- Resolution 1920 x 1080 (16:9). If you can render 2560 x 1440, do; it is downsampled per device.
- Frame rate 24 fps.
- Length 12 to 16 seconds including the holds (about 300 to 380 frames).
- Format: a numbered image sequence, PNG or 16-bit TIFF, named `frame_0001.png` upwards. A
  ProRes 422 or high-bitrate H.264 MP4 (50 Mbps or more) is acceptable instead; frames will be
  extracted from it.
- A shot list with the frame number (or timecode) where each hold starts and ends.
- Optional hold loops: for stops that benefit from subtle motion (rover wheels, RHU heat shimmer,
  blinking status lights), a separate 2-second loop rendered from the same still camera position,
  delivered as its own frame sequence per stop. The page plays the loop while the visitor is
  holding at that stop.
- Optional portrait crop guidance: the page crops 16:9 to the phone's portrait screen by keeping the
  centre. Keep each system near the centre of frame during its hold so phones do not lose it.

## What the page adds on top

Captions, the numbered hotspot on each system, the detail drawers, the progress rail and the
opening and closing text overlays. Hotspot positions are placed by hand on the hold frames.
