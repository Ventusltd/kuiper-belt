# TEST.md: the Android journey on the assembled edition, one run per admission (Opus team 10 tester)

Tester OPUS-10. Page: `http://127.0.0.1:8502/editions/202611012135/`, served by plain `python3 -m http.server 8502
--bind 127.0.0.1` from /home/user/estate/kuiper-belt (nothing substituted). Script: team 10's copy of the NL-009
journey, `/tmp/nl010-opus/team-10/tester/android-journey.cjs` (see `JOURNEY.md` for the shell/card id mapping and the
two added steps). Chromium headless shell with `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader
--ignore-gpu-blocklist`; Playwright `devices['Pixel 7']` (412×839), `devices['Galaxy S24']` (360×780),
`devices['Pixel 7 landscape']` (863×360); real touch (`touchscreen.tap`, CDP `Input.dispatchTouchEvent`); one device
per process, one at a time; 6.5 s fixed wait after load, settle up to 90 s after each fly; screenshot timeout 180 s.
Raw reports: `/tmp/nl010-opus/team-10/tester/runs/<run>-<device>.json` (+ `.log`, screenshots in `<run>-<device>/`).

Rule (ROADMAP step 10): the integrator admits nothing that turns a step red. A step red in the run before the
admission and still red after is "still red", not "turned red". `NOT EVALUATED` is never a pass.

Steps: load (zero console errors, wafer disc, bar one row) · edition-open · edition-close · panel-dismiss (wafer tap,
back gesture) · lines-open · lines-filter · lines-pick (card; header = line of code when the Opus 2 card is present) ·
card-details · card-close · key-e-1..3 · pinch-drag · spark-tap · whole-wafer · modules · see-through.
Under the Opus 1 shell, EDITION = ABOUT, LINES = WAFER, COMMANDS = VIEW (JOURNEY.md).

