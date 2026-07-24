export interface BuildOptions {
  project?: string;
  profile?: string;
  build?: string;
  runtime?: string;
  compiler?: string;
  backend?: string;
  artifact?: string;
}

export function buildArgs(options: BuildOptions): string[] | undefined {
  if ((!options.compiler && !options.backend) || (options.compiler && options.backend)) return undefined;

  const args = ["build"];
  if (options.project) args.push("--project", options.project);
  if (options.profile) args.push("--profile", options.profile);
  if (options.build) args.push("--build", options.build);
  if (options.runtime) args.push("--runtime", options.runtime);
  if (options.compiler) args.push("--compiler", options.compiler);
  if (options.backend) args.push("--backend", options.backend);
  if (options.artifact) args.push("--artifact", options.artifact);
  return args;
}
