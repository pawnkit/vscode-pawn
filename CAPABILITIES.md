# Capability matrix

| UI capability | Backend |
|---|---|
| Project diagnostics, documented hover and completion, navigation, call hierarchy, signature help, semantic highlighting, rename, folding, edits | `pawnlsp` over LSP |
| Whole-file, range, and format-on-type formatting; code actions | `pawnlsp` over LSP |
| Check, format, lint, doctor, and build | `pawn` commands |
| Clickable build diagnostics and artifacts | `pawn build` JSON report |
| Debug launch | `pawndebug` over DAP |
| Test discovery and execution | `pawntest` JSON protocol |
| Test CodeLens actions | `pawntest` discovery through the VS Code test controller |
| Immediate syntax highlighting | Bundled TextMate grammar |
| Manifest validation | Bundled JSON schemas |
| Tool installation | Pinned GitHub releases with checksum verification |

No parser, semantic model, lint rule, formatter, or project resolver is implemented by the extension.
