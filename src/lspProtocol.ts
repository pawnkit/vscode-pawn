export const editorProtocolVersion = 1;

export function managedToolState(managedIncludeRoots: string[]) {
  return { protocolVersion: editorProtocolVersion, managedIncludeRoots };
}

export function initializationOptions(managedIncludeRoots: string[]) {
  return { pawnkit: managedToolState(managedIncludeRoots) };
}
