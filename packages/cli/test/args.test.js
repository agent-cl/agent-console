import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { outputPathFor, parseRmbgArgs } from "../src/args.js";

test("parses one input with defaults", () => {
  const { inputs, options } = parseRmbgArgs(["photo.jpg"]);

  assert.deepEqual(inputs, ["photo.jpg"]);
  assert.equal(options.model, "medium");
  assert.equal(options.format, "png");
  assert.equal(options.quality, 0.8);
});

test("parses aliases and values", () => {
  const { inputs, options } = parseRmbgArgs([
    "photo.jpg",
    "-o",
    "cut.webp",
    "-m",
    "small",
    "-f",
    "webp",
    "-q",
    "0.9",
    "--force",
  ]);

  assert.deepEqual(inputs, ["photo.jpg"]);
  assert.equal(options.output, "cut.webp");
  assert.equal(options.model, "small");
  assert.equal(options.format, "webp");
  assert.equal(options.quality, 0.9);
  assert.equal(options.force, true);
});

test("rejects output with many inputs", () => {
  assert.throws(() => parseRmbgArgs(["a.jpg", "b.jpg", "-o", "out.png"]), /--output only works/);
});

test("rejects invalid quality", () => {
  assert.throws(() => parseRmbgArgs(["a.jpg", "--quality", "2"]), /--quality/);
});

test("builds default output path beside input", () => {
  const out = outputPathFor("images/photo.jpg", { format: "png" });

  assert.equal(out, path.resolve("images/photo-cut.png"));
});

test("builds output path inside out dir", () => {
  const out = outputPathFor("images/photo.jpg", { format: "webp", outDir: "cutouts" });

  assert.equal(out, path.resolve("cutouts/photo-cut.webp"));
});
