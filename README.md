# ChromaKey-Forge

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Validate](https://github.com/DevilsNerve/ChromaKey-Forge/actions/workflows/validate.yml/badge.svg)](https://github.com/DevilsNerve/ChromaKey-Forge/actions/workflows/validate.yml)

A browser-based chroma key lab. Drop in any PNG and ChromaKey-Forge strips a
target hue (default purple) to alpha based on saturation, value, and hue
distance — then bleeds your chosen pulse color through the cutout in real
time. Eyedropper, decontamination, and one-click PNG export. No upload,
all client-side.

**Live demo:** https://<you>.github.io/chromakey-forge/

## Usage
1. Open `index.html` in any modern browser.
2. Drag, paste, or pick a source image.
3. Tune Strength / Softness / Hue tolerance / Decontaminate.
4. Pick your pulse color and backdrop.
5. **Download PNG** to export the keyed image.

## Development

The pixel-processing core has no runtime dependencies. Run its deterministic
tests with Node.js 20 or newer:

```bash
npm test
```

## License

ChromaKey-Forge is licensed under the
[GNU Affero General Public License v3.0](LICENSE), version 3 only
(`AGPL-3.0-only`). If you publish a modified version or let users interact with
one over a network, provide its corresponding source under the same license.

© 2026 Austen J. Green — https://austenjgreen.com
