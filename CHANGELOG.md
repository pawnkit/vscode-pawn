# Changelog

## 0.9.6 - 2026-07-21

- Updated pawnlsp to resolve project-relative includes and sparse macro parameters.

## 0.9.5 - 2026-07-21

- Updated pawnlsp for concise returns, macro-defined tags, and nested quoted includes.

## 0.9.4 - 2026-07-21

- Listed the formatter and linter versions provided by pawnlsp.

## 0.9.3 - 2026-07-21

- Avoided replacing an already-current tool while Windows is using it.

## 0.9.2 - 2026-07-21

- Updated pawnlsp for PawnPlus syntax and conditional include support.

## 0.9.1 - 2026-07-21

- Updated pawnlsp to remove duplicate diagnostics and shorten enum-member hover.

## 0.9.0 - 2026-07-21

- Added source hover for `#define` macros.
- Highlighted macro names after `defined`.

## 0.8.3 - 2026-07-21

- Fixed hover and signature help for variadic functions such as `printf`.

## 0.8.2 - 2026-07-21

- Fixed the managed-include regression test on Windows.

## 0.8.1 - 2026-07-21

- Restored managed pawntest includes after reloading the window.
- Fixed hover and references selecting symbols from the wrong included file.
- Highlighted `defined` in preprocessor conditions.

## 0.8.0 - 2026-07-21

- Added incoming and outgoing call hierarchy through pawnlsp.
- Improved completion ordering and kept local variables within their function.

## 0.7.0 - 2026-07-21

- Added diagnostics for unopened project files.
- Added source comments and API usage details to completion and hover text.

## 0.6.0 - 2026-07-21

- Added range formatting, format-on-type, and parameter-name hints through pawnlsp.

## 0.5.0 - 2026-07-21

- Added symbol highlights, syntax-aware folding, and structural selection through pawnlsp.

## 0.4.0 - 2026-07-21

- Added workspace symbol search and cross-file navigation through pawnlsp.
- Added local and workspace symbol renaming.

## 0.3.0 - 2026-07-21

- Added project and API completion through pawnlsp.
- Added parameter hints while writing function calls.
- Added semantic highlighting for project and API symbols.

## 0.2.9 - 2026-07-21

- Updated pawnlsp so include paths open on Ctrl+click and show the resolved file on hover.

## 0.2.8 - 2026-07-21

- Added richer hover details and API documentation links through pawnlsp.
- Updated managed include paths without restarting the language server.

## 0.2.7 - 2026-07-21

- Updated pawndebug with expandable array variables and correct references.

## 0.2.6 - 2026-07-21

- Grouped discovered tests by file with file and workspace run actions.

## 0.2.5 - 2026-07-21

- Replaced raw JSON test output with concise result lines.

## 0.2.4 - 2026-07-21

- Updated pawnlsp so pawntest macros are not reported as duplicate functions.
- Fixed Test Explorer runs against the released pawntest CLI.

## 0.2.3 - 2026-07-21

- Refreshed Test Explorer after installing pawntest.
- Kept non-header files out of the managed include directory.
- Updated pawnlsp to fix false missing-include diagnostics.
- Improved highlighting for declarations, tags, macros, and constants.

## 0.2.2 - 2026-07-20

- Added managed pawntest headers to language-server include paths.
- Improved highlighting for includes, function calls, tags, and operators.

## 0.2.1 - 2026-07-20

- Connected Test Explorer to pawntest's JSON discovery output.

## 0.2.0 - 2026-07-20

- Added guided installation and updates for PawnKit command-line tools.
- Added checksum verification for downloaded release archives.

## 0.1.0 - 2026-07-19

- Added Pawn syntax highlighting and project schemas.
- Added pawnlsp diagnostics, navigation, formatting, and quick fixes.
- Added PawnKit commands and tasks.
- Added pawndebug and pawntest integration.
