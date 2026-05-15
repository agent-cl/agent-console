#!/usr/bin/env node

import { main } from "../dist/src/cli.js";

main(process.argv.slice(2)).catch((error) => {
  console.error(`agent-console: ${error.message}`);
  process.exitCode = 1;
});
