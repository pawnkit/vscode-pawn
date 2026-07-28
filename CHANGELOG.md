# Changelog

## 0.13.38 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint to reduce analysis cache allocation.

## 0.13.37 - 2026-07-28

### Fixed

- Updated pawnlsp and pawnlint to use unsaved include buffers consistently.

### Performance

- Updated pawnlsp and pawnlint for faster include resolution during repeated
  diagnostics.

## 0.13.36 - 2026-07-28

### Fixed

- Updated pawnlsp and pawnlint to match shared diagnostics on Windows.

## 0.13.35 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint to sort call-graph data once per lint run.

## 0.13.34 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint to avoid resolving calls twice during linting.

## 0.13.33 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint for faster repeated diagnostics.

## 0.13.32 - 2026-07-28

### Performance

- Updated pawnlsp for faster workspace diagnostic filtering.

## 0.13.31 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint for faster cold workspace diagnostics.

## 0.13.30 - 2026-07-28

### Performance

- Updated pawnlsp and pawn-analysis for faster cold project analysis.

## 0.13.29 - 2026-07-28

### Performance

- Updated pawnlsp and pawn-analysis for faster cold workspace diagnostics.

## 0.13.28 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint to reuse include diagnostics.

## 0.13.27 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint to reuse semantic analysis results.

## 0.13.26 - 2026-07-28

### Performance

- Updated pawnlsp to keep incremental project state during rapid edits.

## 0.13.25 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint for faster repeated project linting.

## 0.13.24 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint so stale lint work stops after a newer edit.

## 0.13.23 - 2026-07-28

### Performance

- Updated pawnlsp so local insertions and deletions can reuse the dependency
  graph.

## 0.13.22 - 2026-07-28

### Performance

- Updated pawnlsp so safe function-body edits can reuse the previous dependency
  graph.

## 0.13.21 - 2026-07-28

### Fixed

- Updated pawnlsp for faster, stable project diagnostics.
- Excluded vendored dependency diagnostics.

## 0.13.20 - 2026-07-28

### Fixed

- Updated pawnlsp to clear standalone include diagnostics and use standard
  inactive-code highlighting.

## 0.13.19 - 2026-07-28

### Fixed

- Updated pawnlsp to use project include state for inactive-code highlighting.

## 0.13.18 - 2026-07-28

### Fixed

- Download managed tools without using the rate-limited GitHub API.

## 0.13.17 - 2026-07-28

### Fixed

- Updated pawnlsp to keep project diagnostics consistent for included files.

## 0.13.16 - 2026-07-28

### Fixed

- Updated pawnlsp for normalized project paths on Windows.

## 0.13.15 - 2026-07-28

### Fixed

- Kept workspace diagnostics stable when files are opened.
- Respected include guards in closed-file diagnostics.
- Applied inactive-code highlighting across themes.

### Changed

- Highlighted `automaton` as a Pawn declaration keyword.

## 0.13.14 - 2026-07-28

### Added

- Dim source excluded by conditional compilation.

## 0.13.13 - 2026-07-26

### Fixed

- Updated pawnlsp to v0.32.13 to fix clean workspace diagnostic reports.

## 0.13.12 - 2026-07-26

### Performance

- Updated pawnlsp to v0.32.12 for preprocessing reuse.

## 0.13.11 - 2026-07-26

### Performance

- Updated pawnlsp to v0.32.11 for expanded-analysis reuse.

## 0.13.10 - 2026-07-26

### Performance

- Updated pawnlsp to v0.32.10 for faster analysis of large include graphs.

## 0.13.9 - 2026-07-26

- Updated the managed language server, linter, and debugger.
- Supported SAFW-sized macro expansion without removing preprocessing limits.

## 0.13.8 - 2026-07-26

- Updated managed tools to the July 26 tested release set.

## 0.13.7 - 2026-07-25

- Added the repository support record with CI validation.

## 0.13.6 - 2026-07-25

- Updated managed tools to the current tested release set.

## 0.13.5 - 2026-07-25

- Updated the managed linter and language server to v1.1.10 and v0.26.10.

## 0.13.4 - 2026-07-25

- Updated the managed linter and language server to v1.1.8 and v0.26.8.

## 0.13.3 - 2026-07-25

- Updated `vscode-languageclient` to v10.1.0, fixing a high-severity
  denial-of-service advisory in a bundled dependency.

## 0.13.2 - 2026-07-25

- Updated the managed linter and language server to v1.1.7 and v0.26.7.

## 0.13.1 - 2026-07-24

- Updated the managed CLI, linter, and language server to v1.2.1, v1.1.5,
  and v0.26.4.

## 0.13.0 - 2026-07-24

- Added project build commands and tasks through the PawnKit CLI.
- Updated the managed CLI to the tested v1.2.0 release.

## 0.12.0 - 2026-07-23

- Select managed tool versions from the tested PawnKit release set.

## 0.11.1 - 2026-07-23

- Updated pawnlsp with managed-include lifecycle coverage.

## 0.11.0 - 2026-07-23

- Sent versioned managed-tool state to pawnlsp.
- Updated the managed language server, formatter, and linter.

## 0.10.20 - 2026-07-23

- Completed SA-MP and open.mp API data through pawnlsp.

## 0.10.19 - 2026-07-23

- Added 3D text-label API data through pawnlsp.

## 0.10.18 - 2026-07-23

- Added HTTP API data through pawnlsp.

## 0.10.17 - 2026-07-23

- Added gang-zone API data through pawnlsp.

## 0.10.16 - 2026-07-23

- Added pickup API data through pawnlsp.

## 0.10.15 - 2026-07-23

- Added player-class API data through pawnlsp.

## 0.10.14 - 2026-07-23

- Added object query, attachment, and custom-model API data through pawnlsp.

## 0.10.13 - 2026-07-23

- Added per-player object API data through pawnlsp.

## 0.10.12 - 2026-07-23

- Added object material and editing API data through pawnlsp.

## 0.10.11 - 2026-07-23

- Added core global-object API data through pawnlsp.

## 0.10.10 - 2026-07-23

- Added menu API data through pawnlsp.

## 0.10.9 - 2026-07-23

- Added dialog API data through pawnlsp.

## 0.10.8 - 2026-07-23

- Added checkpoint API data through pawnlsp.

## 0.10.7 - 2026-07-23

- Added actor API data through pawnlsp.

## 0.10.6 - 2026-07-23

- Updated pawnlsp so diagnostics can link to related source locations.

## 0.10.5 - 2026-07-23

- Added a project-configuration action to health findings.
- Updated to PawnKit CLI `v1.1.1`, which removes unsupported dependency commands from health findings.

## 0.10.4 - 2026-07-23

- Updated pawnlsp for bounded completion and project-first ranking.

## 0.10.3 - 2026-07-23

- Added include-path and preprocessor directive completion through pawnlsp.
- Made project health follow the active folder in multi-root workspaces.

## 0.10.2 - 2026-07-23

- Updated pawnlsp for clickable lint and analysis documentation.

## 0.10.1 - 2026-07-23

- Added an in-editor project-health view with file and remediation actions.
- Added custom include directory selection during project setup.
- Added a one-time prompt when managed tools have pinned updates available.

## 0.10.0 - 2026-07-23

- Added guided PawnKit project setup.
- Added a project-health indicator to the status bar.
- Added links from pawnlint diagnostics to their rule documentation.
- Updated the managed language server to `v0.10.0`.
- Updated the managed PawnKit CLI to `v1.1.0`.

## 0.9.14 - 2026-07-23

- Updated the managed language server, CLI, test runner, formatter, and linter.

## 0.9.13 - 2026-07-23

- Updated the managed PawnKit CLI to `v1.0.2`.

## 0.9.12 - 2026-07-23

- Updated the managed PawnKit CLI to `v1.0.1`.

## 0.9.11 - 2026-07-22

- Updated pawnlsp for compiler constants, YSI iterators, `void:` functions, and backslash include formatting.

## 0.9.10 - 2026-07-22

- Updated pawnlsp to handle large include graphs without exhausting memory.

## 0.9.9 - 2026-07-21

- Updated pawnlsp to resolve more existing include layouts and reduce workspace diagnostic noise.

## 0.9.8 - 2026-07-21

- Updated pawnlsp to ignore dependencies and inactive files in workspace diagnostics.

## 0.9.7 - 2026-07-21

- Updated pawnlsp to remove false PawnPlus tag warnings from closed files.

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
