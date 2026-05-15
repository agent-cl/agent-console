import fs from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Config } from "@imgly/background-removal-node";
import { VERSION, helpText, outputPathFor, parseRmbgArgs, rmbgHelpText } from "./args.js";
import type { CutType, ModelName, OutputFormat, RmbgOptions } from "./args.js";

const require = createRequire(import.meta.url);

interface BackgroundRemovalApi {
  removeBackground: (image: URL | string, configuration?: Config) => Promise<Blob>;
  removeForeground: (image: URL | string, configuration?: Config) => Promise<Blob>;
  segmentForeground: (image: URL | string, configuration?: Config) => Promise<Blob>;
}

const MIME_BY_FORMAT: Record<OutputFormat, "image/png" | "image/webp"> = {
  png: "image/png",
  webp: "image/webp",
};

export async function main(argv: string[]): Promise<void> {
  if (argv.length === 0 || argv[0] === "help" || argv[0] === "-h" || argv[0] === "--help") {
    console.log(helpText());
    return;
  }

  if (argv[0] === "-v" || argv[0] === "--version") {
    console.log(VERSION);
    return;
  }

  const [command, ...rest] = argv;

  if (command === "rmbg") {
    await runRmbg(rest);
    return;
  }

  throw new Error(`unknown command: ${command}`);
}

async function runRmbg(argv: string[]): Promise<void> {
  const { inputs, options } = parseRmbgArgs(argv);

  if (options.help) {
    console.log(rmbgHelpText());
    return;
  }

  if (options.version) {
    console.log(VERSION);
    return;
  }

  for (const input of inputs) {
    await cutImage(input, options);
  }
}

async function cutImage(input: string, options: RmbgOptions): Promise<void> {
  const { backgroundRemoval, publicPath } = loadBackgroundRemoval();
  const sourcePath = path.resolve(input);
  const outputPath = outputPathFor(input, options);
  const remove = removerForType(backgroundRemoval, options.type);

  await assertReadableFile(sourcePath);
  await prepareOutput(outputPath, options.force);

  if (!options.quiet) {
    console.error(`Cutting ${sourcePath}`);
  }

  const blob = await remove(pathToFileURL(sourcePath), {
    debug: options.debug,
    model: options.model as ModelName,
    publicPath,
    output: {
      format: MIME_BY_FORMAT[options.format],
      quality: options.quality,
    },
    progress: options.quiet
      ? undefined
      : (key: string, current: number, total: number) => {
          if (total > 0) {
            const percent = Math.round((current / total) * 100);
            process.stderr.write(`\rDownloading ${key}: ${percent}%`);
          }
        },
  });

  if (!options.quiet) {
    process.stderr.write("\n");
  }

  const buffer = Buffer.from(await blob.arrayBuffer());
  await fs.writeFile(outputPath, buffer);

  if (!options.quiet) {
    console.log(outputPath);
  }
}

function removerForType(backgroundRemoval: BackgroundRemovalApi, type: CutType) {
  switch (type) {
    case "foreground":
      return backgroundRemoval.removeBackground;
    case "background":
      return backgroundRemoval.removeForeground;
    case "mask":
      return backgroundRemoval.segmentForeground;
    default:
      throw new Error(`unsupported type: ${type}`);
  }
}

function loadBackgroundRemoval() {
  const module = require("node:module") as {
    _resolveFilename: (
      request: string,
      parent: NodeModule | null | undefined,
      isMain: boolean,
      options?: unknown,
    ) => string;
  };
  const originalResolveFilename = module._resolveFilename;
  const redirectedPackages = new Set(["lodash", "sharp", "zod"]);

  module._resolveFilename = function resolveAgentToolDependency(
    request,
    parent,
    isMain,
    options,
  ): string {
    if (
      redirectedPackages.has(request) &&
      parent?.filename?.includes(`node_modules${path.sep}@imgly${path.sep}background-removal-node`)
    ) {
      return require.resolve(request);
    }

    return originalResolveFilename.call(this, request, parent, isMain, options);
  };

  try {
    const modulePath = require.resolve("@imgly/background-removal-node");
    const publicPath = new URL("./", pathToFileURL(modulePath)).href;

    return {
      backgroundRemoval: require("@imgly/background-removal-node") as BackgroundRemovalApi,
      publicPath,
    };
  } finally {
    module._resolveFilename = originalResolveFilename;
  }
}

async function assertReadableFile(filePath: string): Promise<void> {
  let stat;

  try {
    stat = await fs.stat(filePath);
  } catch {
    throw new Error(`input not found: ${filePath}`);
  }

  if (!stat.isFile()) {
    throw new Error(`input is not a file: ${filePath}`);
  }
}

async function prepareOutput(outputPath: string, force: boolean): Promise<void> {
  await fs.mkdir(path.dirname(outputPath), { recursive: true });

  try {
    await fs.access(outputPath);
  } catch {
    return;
  }

  if (!force) {
    throw new Error(`output already exists: ${outputPath} (use --force to overwrite)`);
  }
}
