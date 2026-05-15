# agent-console

CLI toolbox for AI workflows. First command available now: `rmbg`.

`agent-console rmbg` uses `@imgly/background-removal-node`, which runs an ONNX model locally. First run downloads model assets and takes longer; later runs use cache.

## Usage

```sh
npx agent-console rmbg portrait.jpg
npx agent-console rmbg product.jpg --output product-cut.png
npx agent-console rmbg photos/*.jpg --out-dir cutouts --model small
```

Default output is `<name>-cut.png` beside the source image.

## Options

```txt
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
```

## Development

```sh
npm install
npm test
npm run pack:check
```

## License

MIT.
