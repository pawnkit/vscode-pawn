# PawnKit for VS Code

PawnKit connects VS Code to the PawnKit command-line tools. The extension keeps
editor code small: `pawnlsp` handles language features, `pawn` runs project
checks, and the optional debugger and test tools keep their own protocols.

## Getting started

When a tool is missing, the extension offers to download a compatible release.
Downloads require confirmation and are checked against the release checksum.
Use **PawnKit: Install/Update Tools** to manage them later.

Use **PawnKit: Set Up Project** in an existing Pawn workspace to choose its
entry file and target. The extension finds conventional include directories
and creates `pawn.json` through the PawnKit CLI.

To manage the tools yourself, install them with Go:

```sh
go install github.com/pawnkit/pawnlsp/cmd/pawnlsp@latest
go install github.com/pawnkit/pawnkit-cli/cmd/pawn@latest
```

Open a Pawn project or source file. The extension prefers tools already on
`PATH`. To use a specific copy, set
`pawn.server.path` and `pawn.cli.path` in VS Code. `pawn.debug.path` and
`pawn.test.path` configure the optional `pawndebug` and `pawntest` backends.

The extension adds syntax highlighting, diagnostics, navigation, formatting,
quick fixes, project checks, debug launch support, Test Explorer integration,
and JSON schemas for PawnKit project files.

Available project commands are Check, Format, Lint, and Diagnose. They match
the commands shipped by `pawnkit-cli v1`.

## Troubleshooting

- Run **PawnKit: Install/Update Tools** to repair or update managed tools.
- Run `Pawn: Show Language Server Output` for server logs.
- Run `Pawn: Restart Language Server` after replacing `pawnlsp`.
- Trust the workspace before running tools or debugging.

The extension has no telemetry. Source files stay on your machine. Managed
tools come from pinned PawnKit releases on GitHub.

## Compatibility

The extension requires VS Code 1.90 or later. Backend protocols have their own
versions. Test Explorer accepts pawntest discovery schema version 1.

## Contributing

This is a community project. Extension fixes, screenshots, and small
reproduction projects are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
