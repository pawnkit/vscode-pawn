# Changelog

## 0.18.38 - 2026-08-01

- Add color decorators and picker support for Pawn hex values, including
  colors embedded in strings.

## 0.18.37 - 2026-08-01

- Stop the running language server while managed tools are replaced, then start it again after the install completes.

## 0.18.36 - 2026-08-01

- Use the corrected signed toolchain with pawnlint 1.8.22 and pawnlsp 0.33.86.

## 0.18.35 - 2026-08-01

- Use the signed toolchain with pawnlint 1.8.22 and pawnlsp 0.33.86.

## 0.18.34 - 2026-08-01

- Use the signed toolchain with pawnlint 1.8.21 and pawnlsp 0.33.85.

## 0.18.33 - 2026-08-01

### Performance

- Use the signed toolchain with pawnlint 1.8.20 and pawnlsp 0.33.84.

## 0.18.32 - 2026-08-01

### Performance

- Use the signed toolchain with pawnlint 1.8.19 and pawnlsp 0.33.83.

## 0.18.31 - 2026-08-01

### Performance

- Use the signed toolchain with pawnlint 1.8.18 and pawnlsp 0.33.82.

## 0.18.30 - 2026-08-01

### Performance

- Use the workspace-incremental toolchain with pawnlsp 0.33.81.

## 0.18.29 - 2026-08-01

### Performance

- Use the signed toolchain with the incremental pawnlsp 0.33.80 release.

## 0.18.28 - 2026-08-01

### Changed

- Use the signed toolchain with pawnlint 1.8.16 and pawnlsp 0.33.79.

## 0.18.27 - 2026-08-01

### Changed

- Use the signed toolchain with pawnlint 1.8.15 and pawnlsp 0.33.78.

## 0.18.26 - 2026-08-01

### Changed

- Use the signed toolchain with pawnlint 1.8.14 and pawnlsp 0.33.77.

## 0.18.25 - 2026-08-01

### Performance

- Use the signed toolchain with the latest linter and language server fixes.

## 0.18.24 - 2026-08-01

### Performance

- Use the signed toolchain with trivia-only incremental analysis improvements.
- Update PawnKit CLI to v1.34.1, pawnlint to v1.8.11, and pawnlsp to v0.33.73.

## 0.18.23 - 2026-08-01

### Fixed

- Use conventional modifier scopes for Pawn declaration keywords.
- Added tokenization coverage for directives, hooks, loops, functions, and
  constants.
- Use the signed August 1 toolchain set.
- Update the CLI to v1.34.0, the linter to v1.8.10, and the language server
  to v0.33.72.

## 0.18.22 - 2026-07-30

- Use the signed July 30 toolchain set.
- Update PawnKit CLI to v1.6.0 and pawnlint to v1.8.7.

## 0.18.21 - 2026-07-30

### Fixed

- Updated pawnlsp to v0.33.71 to restore fast single-file diagnostics.

## 0.18.20 - 2026-07-30

### Performance

- Updated pawnlsp to v0.33.70 to reduce duplicate editor linting work.

## 0.18.19 - 2026-07-30

### Performance

- Updated pawnlsp to v0.33.69 for faster token-moving edits.

## 0.18.18 - 2026-07-30

### Performance

- Updated pawnlsp to v0.33.68 for faster strict editor linting.

## 0.18.17 - 2026-07-29

### Performance

- Updated pawnlsp to v0.33.67 for faster diagnostics on large files.

## 0.18.16 - 2026-07-29

### Performance

- Updated pawnlsp to v0.33.66 for faster local analysis.

## 0.18.15 - 2026-07-29

### Fixed

- Resolve relative pawnlint config paths from the workspace.

### Performance

- Updated pawnlsp to v0.33.65 for lower include-heavy diagnostic overhead.

## 0.18.14 - 2026-07-29

### Performance

- Updated pawnlsp to v0.33.64 for faster strict loop checks.

## 0.18.13 - 2026-07-29

### Performance

- Updated pawnlsp to v0.33.63 for faster strict-profile analysis.

## 0.18.12 - 2026-07-29

### Performance

- Updated pawnlsp to v0.33.62 for faster strict-profile checks.

## 0.18.11 - 2026-07-29

### Fixed

- Updated pawnlsp to v0.33.61 to accept open.mp API tag aliases.

## 0.18.10 - 2026-07-29

### Fixed

- Updated pawnlsp to v0.33.60 for faster strict linting and fewer false
  positives.

## 0.18.9 - 2026-07-29

### Changed

- Install PawnKit CLI v1.5.1 from the signed toolchain set.

## 0.18.8 - 2026-07-29

### Changed

- Use the signed PawnKit toolchain set.

## 0.18.7 - 2026-07-29

### Changed

- Use the tested toolchain set with PawnKit CLI v1.5.0.

## 0.18.6 - 2026-07-29

### Changed

- Use the hardened July 29 toolchain set.

## 0.18.5 - 2026-07-29

### Changed

- Use the July 29 tested toolchain release set.

## 0.18.4 - 2026-07-29

### Changed

- Updated pawntest to v1.2.5.

## 0.18.3 - 2026-07-29

### Changed

- Updated pawntest to v1.2.4.

## 0.18.2 - 2026-07-29

### Changed

- Updated pawntest to v1.2.3 and pawndebug to v0.2.2.

## 0.18.1 - 2026-07-29

### Changed

- Updated pawnlsp to v0.33.53.

## 0.18.0 - 2026-07-29

### Added

- Added Build and Run actions above top-level `main` functions.
- Added the Run Project command and task.

## 0.17.2 - 2026-07-29

### Changed

- Updated pawnlsp to v0.33.52 and pawnlint to v1.7.21.

## 0.17.1 - 2026-07-29

### Changed

- Updated pawnlsp to v0.33.51 for faster diagnostics on macro-heavy projects.
- Updated the PawnKit CLI to v1.4.2.

## 0.17.0 - 2026-07-29

### Added

- Show compiler build diagnostics in the Problems panel.
- Offer to reveal a successful build artifact.

### Changed

- Updated the PawnKit CLI to v1.4.1.

## 0.16.0 - 2026-07-29

### Added

- Added CodeLens actions to run one test or every test in a file.

## 0.15.0 - 2026-07-29

### Added

- Added a getting-started walkthrough for tools, project setup, checks, and
  builds.

## 0.14.0 - 2026-07-29

### Added

- Show the resolved profile, build, runtime, health, and project actions from
  one status item.

### Changed

- Updated the PawnKit CLI to v1.4.0.
- Hide the language-server status item while the server is running.

## 0.13.63 - 2026-07-29

### Added

- Show cancellable progress when diagnostics take longer than 500 ms.

## 0.13.62 - 2026-07-29

### Performance

- Updated pawnlsp so diagnostics no longer delay formatting.

## 0.13.61 - 2026-07-29

### Fixed

- Do not duplicate a leading file header when formatting on save.
- Use one whole-file formatting request on save by default.

## 0.13.60 - 2026-07-29

### Added

- Number variadic inlay hints as `arg1`, `arg2`, and so on.

### Fixed

- Keep grouped `#define` alignment when formatting on save.

## 0.13.59 - 2026-07-29

### Fixed

- Show declarations and source comments when hovering over dependency functions.
- Resolve go-to-definition for dependency functions in large include graphs.

## 0.13.58 - 2026-07-29

### Added

- Show colour previews and a picker for `{RRGGBB}` colours inside strings.

### Changed

- Align consecutive `#define` values when formatting.

## 0.13.57 - 2026-07-29

### Fixed

- Updated pawnlsp to format changed ranges spanning several declarations.

## 0.13.56 - 2026-07-29

### Fixed

- Updated pawnlsp so range formatting does not wait for analysis during save.

## 0.13.55 - 2026-07-29

### Performance

- Updated pawnlsp to avoid full-output parsing during range formatting.

## 0.13.54 - 2026-07-29

### Performance

- Format modified Pawn syntax units on save when source control ranges are
  available.
- Updated pawnlsp for faster range formatting.

## 0.13.53 - 2026-07-28

### Added

- Show colour previews beside hexadecimal Pawn colours.
- Highlight common YSI declarations and `foreach` loops.

### Fixed

- Show all parameter hints, including matching argument names.
- Remove repeated quick fixes and unreachable-code warnings.
- Show forwarded signatures for macros such as `PlayerDialog_Show`.
- Restore references from expanded include files.

## 0.13.52 - 2026-07-28

### Fixed

- Removed false YSI include-cycle and macro-call diagnostics.

## 0.13.51 - 2026-07-28

### Fixed

- Keep dependency diagnostics in the active project context.

## 0.13.50 - 2026-07-28

### Performance

- Updated the language server with shared callable-variant lookups.

## 0.13.49 - 2026-07-28

### Performance

- Updated the language server with typed reference sorting.

## 0.13.48 - 2026-07-28

### Performance

- Updated the language server with faster reference sorting.

## 0.13.47 - 2026-07-28

### Performance

- Updated the language server with cached include resolution.

## 0.13.46 - 2026-07-28

### Performance

- Updated the language server with faster lint call-graph construction.

## 0.13.45 - 2026-07-28

### Performance

- Updated the language server with faster lint reference indexing.

## 0.13.44 - 2026-07-28

### Performance

- Updated the language server with cached include filesystem probes.

## 0.13.43 - 2026-07-28

### Performance

- Updated the language server with faster define-environment reuse.

## 0.13.42 - 2026-07-28

### Performance

- Updated the language server to release stale lint cache generations.

## 0.13.41 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint to reuse define contexts between diagnostics.

## 0.13.40 - 2026-07-28

### Performance

- Updated pawnlsp and pawnlint for faster reference indexing.

## 0.13.39 - 2026-07-28

### Performance

- Updated pawnlsp, pawnlint, and pawn-project for faster project indexing.

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
