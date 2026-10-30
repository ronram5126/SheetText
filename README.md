# SheetText

SheetText is a cross-platform rich text and HTML editor plugin for Microsoft Excel and ONLYOFFICE, powered by TipTap.

## Features

- Rich text editing based on TipTap
- HTML sanitization for safer rendering
- Integration assets for Excel and ONLYOFFICE
- Automated release packaging workflow

## Requirements

- Node.js 22+
- npm 10+

## Getting Started

```bash
npm ci
npm run build
npm test
```

## Project Structure

- `src/editor/` core editor adapter and sanitization logic
- `src/excel/` Excel task pane and manifest assets
- `src/onlyoffice/` ONLYOFFICE plugin assets
- `scripts/release.mjs` release packaging script

## Versioning

This project follows [Semantic Versioning](https://semver.org/).

- The canonical version is `package.json` (`version` field).
- Release tags must match that version and use the `v` prefix (example: `v1.2.3`).
- The release workflow validates that the Git tag and `package.json` version are aligned.

## Releasing

1. Update `package.json` version.
2. Commit and push your changes.
3. Create and push a tag that matches the version:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. GitHub Actions runs `.github/workflows/release.yml` to:
   - install dependencies
   - run tests
   - build release assets
   - publish a GitHub Release with packaged artifacts

## License

MIT License. See [LICENSE](LICENSE).
