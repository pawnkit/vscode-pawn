# Capability matrix

| UI capability | Backend |
|---|---|
| Diagnostics, navigation, hover, edits | `pawnlsp` over LSP |
| Formatting and code actions | `pawnlsp` over LSP |
| Check, format, lint, and doctor | `pawn` commands |
| Debug launch | `pawndebug` over DAP |
| Test discovery and execution | `pawntest` JSON protocol |
| Immediate syntax highlighting | Bundled TextMate grammar |
| Manifest validation | Bundled JSON schemas |

No parser, semantic model, lint rule, formatter, or project resolver is implemented by the extension.
