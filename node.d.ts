declare module "node:process" {
  function cwd(): string;
}

declare module "node:os" {
  function homedir(): string;
}

declare module "node:path" {
  function join(p1: string, p2: string): string;
  function resolve(p1: string, p2?: string): string;
  function parse(p1: string): { root: string; ext: string };
  function isAbsolute(p1: string): boolean;
  function dirname(p1: string): string;
}

declare module "node:fs" {
  function statSync(p1: string): asserts p1;
}
