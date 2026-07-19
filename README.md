# PawnKit for VS Code

PawnKit connects VS Code to the PawnKit command-line tools. The extension keeps
editor code small: `pawnlsp` handles language features, `pawn` runs project
checks, and the optional debugger and test tools keep their own protocols.

## Getting started

Install the two main backends:

```sh
go install github.com/pawnkit/pawnlsp/cmd/pawnlsp@latest
go install github.com/pawnkit/pawnkit-cli/cmd/pawn@latest
```

Open a Pawn project or source file. If the tools are not on `PATH`, set
`pawn.server.path` and `pawn.cli.path` in VS Code. `pawn.debug.path` and
`pawn.test.path` configure the optional `pawndebug` and `pawntest` backends.

The extension adds syntax highlighting, diagnostics, navigation, formatting,
quick fixes, project checks, debug launch support, Test Explorer integration,
and JSON schemas for PawnKit project files.

Available project commands are Check, Format, Lint, and Diagnose. They match
the commands shipped by `pawnkit-cli v1`.

## Troubleshooting

- If a tool is missing, set its path in VS Code settings.
- Run `Pawn: Show Language Server Output` for server logs.
- Run `Pawn: Restart Language Server` after replacing `pawnlsp`.
- Trust the workspace before running tools or debugging.

The extension has no telemetry and does not download tools. Source files stay
on your machine unless a backend chosen by you sends them elsewhere.

## Compatibility

The extension requires VS Code 1.90 or later. Backend protocols have their own
versions. Test Explorer accepts pawntest discovery schema version 1.

## Contributing

This is a community project. Extension fixes, screenshots, and small
reproduction projects are welcome; see [CONTRIBUTING.md](CONTRIBUTING.md).
