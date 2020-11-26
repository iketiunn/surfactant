#!/usr/bin/env node

import { genAsyncMethodInterface } from "./";

Promise.resolve()
  .then(() => process.argv.slice(2)[0])
  .then(genAsyncMethodInterface)
  .then(console.log)
  .catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
