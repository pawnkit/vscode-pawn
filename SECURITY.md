# Security

Report vulnerabilities through GitHub's private
[security advisory form](https://github.com/pawnkit/vscode-pawn/security/advisories/new).

The extension runs tools only in trusted workspaces. It does not use a shell,
limits captured output, sends no telemetry, and does not download binaries.
Configured tool paths are treated as explicit user choices.
