# Security

Report vulnerabilities through GitHub's private
[security advisory form](https://github.com/pawnkit/vscode-pawn/security/advisories/new).

The extension runs tools only in trusted workspaces. It does not use a shell,
limits captured output, and sends no telemetry. Tool installation requires
confirmation and verifies pinned GitHub release archives against their SHA-256
checksums. Configured tool paths are treated as explicit user choices.
