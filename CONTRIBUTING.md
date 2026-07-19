# Contributing

PawnKit is maintained by volunteers, so reviews may take a little time.

Extension fixes, editor screenshots, and short reproduction projects are
welcome. You can work on the client without knowing every PawnKit backend.

Install locked dependencies and run:

```sh
npm ci
npm test
npm run package
npm run verify-package -- vscode-pawn-0.1.0.vsix
```

Keep the extension thin. Parsing, analysis, formatting, and project discovery
belong in their backend repositories. Do not add telemetry or run workspace
tools before VS Code grants workspace trust.
