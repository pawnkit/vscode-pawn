# Capability matrix

| UI capability | Backend |
|---|---|
| Diagnostics, workspace navigation, hover, completion, signature help, semantic highlighting, rename, folding, edits | `pawnlsp` over LSP |
| Whole-file, range, and format-on-type formatting; code actions | `pawnlsp` over LSP |
| Check, format, lint, and doctor | `pawn` commands |
| Debug launch | `pawndebug` over DAP |
| Test discovery and execution | `pawntest` JSON protocol |
| Immediate syntax highlighting | Bundled TextMate grammar |
| Manifest validation | Bundled JSON schemas |
| Tool installation | Pinned GitHub releases with checksum verification |

No parser, semantic model, lint rule, formatter, or project resolver is implemented by the extension.
