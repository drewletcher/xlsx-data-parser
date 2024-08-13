#!/usr/bin/env node
/* eslint-disable node/shebang */
/**
 * xlsx-data-parser
 */
"use strict";

const XLSXDataReader = require("./lib/XLSXDataReader.js");
const RepeatCellTransform = require("./lib/RepeatCellTransform.js");
const RepeatHeadingTransform = require("./lib/RepeatHeadingTransform.js");
const RowAsObjectTransform = require("./lib/RowAsObjectTransform.js");
const FormatCSV = require("./lib/FormatCSV.js");
const FormatJSON = require("./lib/FormatJSON.js");
const { parse } = require("jsonc-parser");
const Package = require("./package.json");
const colors = require('colors');

const { open, readFile } = require('node:fs/promises');
const { pipeline } = require('node:stream/promises');
const { stdout } = require('node:process');

colors.enable();

// default program options
var options = {
  url: "",
  format: "json",
  output: "",
  cells: "1-256",
  trim: true
}

/**
 * parseArgs
 *   only filename is required
 *   example ["node.exe", "xlsx-data-parser.js", <filename.xlsx|URL>, <output> "--cells=3", "--heading=title", "--repeating" "--headers=c1,c2,.." "--format=json|csv|rows" ]
 */
async function parseArgs() {

  let i = 2;
  while (i < process.argv.length) {
    let arg = process.argv[ i ];

    if (arg[ 0 ] !== "-") {
      if (!options.url)
        options.url = arg;
      else
        options.output = arg;
    }
    else {
      let nv = arg.split('=');

      if (nv[ 0 ] === "--options") {
        let optionsfile = await readFile(nv[ 1 ], { encoding: 'utf8' });
        let perrors = [];
        let poptions = {
          disallowComments: false,
          allowTrailingComma: true,
          allowEmptyContent: false
        };
        Object.assign(options, parse(optionsfile, perrors, poptions));
      }
      else if (nv[ 0 ] === "--sheet")
        options.sheetName = parseInt(nv[ 1 ]);
      else if (nv[ 0 ] === "--range")
        options.range = parseInt(nv[ 1 ]);
      else if (nv[ 0 ] === "--cells")
        options.cells = parseInt(nv[ 1 ]);
      else if (nv[ 0 ] === "--heading")
        options.heading = nv[ 1 ];
      else if (nv[ 0 ].includes("--headers"))
        options.headers = nv[ 1 ].split(",");
      else if (nv[ 0 ] === "--format")
        options.format = nv[ 1 ];
    }
    ++i;
  }

}

/**
 * Program entry point.
 */
(async () => {
  let retCode = 0;

  await parseArgs();

  let stdoutput = options.output === "" || !options.url;

  if (!stdoutput) {
    console.log("xdp XLSX Data Parser " + Package.version);
    console.log("Copyright 2024 Drew O. Letcher | The MIT License");
  }

  if (!options.url) {
    console.log("");
    console.log("Parse tabular data from a XLSX file.");
    console.log("");
    console.log("xdp [--options=filename.json] <filename.xlsx|URL> [<output>] [--heading=title] [--id=name] [--cells=#] [--headers=name1,name2,...] [--format=json|csv|rows]");
    console.log("");
    console.log("  filename|URL - path name or URL of XLSX file to process, required.");
    console.log("  output       - local path name for output of parsed data, default stdout.");
    console.log("  --options    - JSON or JSONC file containing xdp options, optional.");    console.log("  --sheet      - sheet name (tab) in workbook to process");
    console.log("  --range      - data selection, A1-style range, e.g. \"A3:M24\", default all rows/columns.")
    console.log("  --heading    - text of heading to find in document that precedes desired data table, default none.");
    console.log("  --cells      - minimum number of cells for a data row, default = 1.");
    console.log("  --headers    - comma separated list of column names for data, default none first table row contains names.");
    console.log("  --format     - output data format JSON, CSV or rows (JSON arrays), default JSON.");
    console.log("");
    return;
  }

  try {
    let pipes = [];

    let reader = new XLSXDataReader(options);
    pipes.push(reader);

    if (Object.hasOwn( options,  "RepeatCell.column") || Object.hasOwn( options, "column")) {
      let transform = new RepeatCellTransform(options);
      pipes.push(transform);
    }

    if (Object.hasOwn( options, "RepeatHeading.header") || Object.hasOwn( options, "header")) {
      let transform = new RepeatHeadingTransform(options);
      pipes.push(transform);
    }

    if (options?.format.toLowerCase() !== "rows") {
      let transform = new RowAsObjectTransform(options);
      pipes.push(transform);
    }

    let formatter = options?.format.toLowerCase() === "csv" ? new FormatCSV() : new FormatJSON();
    pipes.push(formatter);

    let writer;
    if (options.output) {
      let fd = await open(options.output, "w");
      writer = fd.createWriteStream();
    }
    else
      writer = process.stdout;
    pipes.push(writer);

    await pipeline(pipes);

    if (options.output)
      writer.end();
  }
  catch (err) {
    console.error(err.message.red);
    retCode = 1;
  }

  if (!stdoutput) {
    if (retCode === 0)
      console.log("parser results OK".green);
    else
      console.log(" parser failed.".red);
  }

  process.exitCode = retCode;
})();
