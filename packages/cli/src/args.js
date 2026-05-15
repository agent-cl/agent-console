import path from "node:path";

export const VERSION = "0.1.1";

const DEFAULTS = {
  model: "medium",
  format: "png",
  quality: 0.8,
  type: "foreground",
  force: false,
  quiet: false,
  debug: false,
  help: false,
  version: false,
};

const MODEL_VALUES = new Set(["small", "medium"]);
const FORMAT_VALUES = new Set(["png", "webp"]);
const TYPE_VALUES = new Set(["foreground", "background", "mask"]);

export function parseRmbgArgs(argv) {
  const options = { ...DEFAULTS };
  const inputs = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--") {
      inputs.push(...argv.slice(index + 1));
      break;
    }

    if (!arg.startsWith("-") || arg === "-") {
      inputs.push(arg);
      continue;
    }

    const [name, inlineValue] = arg.includes("=") ? arg.split(/=(.*)/s, 2) : [arg, undefined];
    const readValue = () => {
      if (inlineValue !== undefined) return inlineValue;
      index += 1;
      if (index >= argv.length || argv[index].startsWith("-")) {
        throw new Error(`${name} needs a value`);
      }
      return argv[index];
    };

    switch (name) {
      case "-h":
      case "--help":
        options.help = true;
        break;
      case "-v":
      case "--version":
        options.version = true;
        break;
      case "-o":
      case "--output":
        options.output = readValue();
        break;
      case "-d":
      case "--out-dir":
        options.outDir = readValue();
        break;
      case "-m":
      case "--model":
        options.model = readValue();
        break;
      case "-f":
      case "--format":
        options.format = readValue();
        break;
      case "-q":
      case "--quality":
        options.quality = Number(readValue());
        break;
      case "-t":
      case "--type":
        options.type = readValue();
        break;
      case "--force":
        options.force = true;
        break;
      case "--quiet":
        options.quiet = true;
        break;
      case "--debug":
        options.debug = true;
        break;
      default:
        throw new Error(`unknown option ${arg}`);
    }
  }

  if (options.help || options.version) {
    return { inputs, options };
  }

  if (inputs.length === 0) {
    throw new Error("missing input image");
  }

  if (options.output && options.outDir) {
    throw new Error("use either --output or --out-dir, not both");
  }

  if (options.output && inputs.length > 1) {
    throw new Error("--output only works with one input");
  }

  if (!MODEL_VALUES.has(options.model)) {
    throw new Error("--model must be small or medium");
  }

  if (!FORMAT_VALUES.has(options.format)) {
    throw new Error("--format must be png or webp");
  }

  if (!TYPE_VALUES.has(options.type)) {
    throw new Error("--type must be foreground, background, or mask");
  }

  if (!Number.isFinite(options.quality) || options.quality < 0 || options.quality > 1) {
    throw new Error("--quality must be a number from 0 to 1");
  }

  return { inputs, options };
}

export function outputPathFor(input, options) {
  if (options.output) {
    return path.resolve(options.output);
  }

  const extension = options.format;
  const directory = options.outDir ? path.resolve(options.outDir) : path.dirname(path.resolve(input));
  const parsed = path.parse(input);
  const basename = parsed.name || "image";

  return path.join(directory, `${basename}-cut.${extension}`);
}

export function helpText() {
  return `agent-console ${VERSION}

Terminal toolkit with multiple AI commands.

Usage:
  agent-console <command> [options]

Commands:
  rmbg                   Remove image background

Global options:
  -v, --version          Print version
  -h, --help             Show help

Try:
  agent-console rmbg --help
`;
}

export function rmbgHelpText() {
  return `agent-console rmbg ${VERSION}

Remove image backgrounds from your terminal.

Usage:
  agent-console rmbg <image> [options]
  agent-console rmbg <image...> --out-dir <dir> [options]

Options:
  -o, --output <file>       Output path for one image
  -d, --out-dir <dir>      Output directory for one or many images
  -m, --model <name>       Model: small or medium (default: medium)
  -f, --format <format>    Output: png or webp (default: png)
  -q, --quality <number>   Output quality from 0 to 1 (default: 0.8)
  -t, --type <type>        foreground, background, or mask (default: foreground)
      --force              Overwrite existing output files
      --quiet              Only print errors
      --debug              Print model debug output
  -v, --version            Print version
  -h, --help               Show help

Examples:
  agent-console rmbg portrait.jpg
  agent-console rmbg product.jpg --output product-cut.png
  agent-console rmbg photos/*.jpg --out-dir cutouts --model small
`;
}
