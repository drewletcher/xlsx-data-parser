# xlsx-data-parser 1.0.x

Parse, search and stream tabular data from HTML documents using Node.js and isaacs/sax-js.

This readme explains how to use xlsx-data-parser in your code or as a stand-alone program.

> Only supports HTML documents containing TABLE elements. Does not support parsing grid or other table like elements.

## Installation

For use as command line utility. Requires Node.js 18+.

```bash
npm -g install xlsx-data-parser
```

For use as module in a Node.js project. See Developers Guide below.

```bash
npm install xlsx-data-parser
```

## CLI Program

---

Parse tabular data from a HTML document.

```bash
hdp [--options=filename.json] <URL|filename.html> [<output-file>] [--heading=title] [--id=name] [--cells=#] [--headers=name1,name2,...] [--format=json|csv|rows]

  `--options`    - file containing JSON object with hdp options, optional.
  `filename|URL` - path name or URL of HTML file to process, required.
  `output-file`  - local path name for output of parsed data, default stdout.
  `--heading`    - text of heading to find in document that precedes desired data table, default none.
  `--id`         - TABLE element id attribute to find in document.
  `--cells`      - minimum number of cells for a data row, default = 1.
  `--headers`    - comma separated list of column names for data, default none the first table row contains names.
  `--format`     - output data format JSON, CSV or rows (JSON arrays), default JSON.
```

Note: If the `hdp` command conflicts with another program on your system use `hdpdataparser` instead.

### Options File

The options file supports options for all xlsx-data-parser modules.

```javascript
{
  ///// HtmlDataParser options
  // url - local path name or URL of HTML file to process, required.
  "url": "",
  // output - local path name for output of parsed data, default stdout.
  "output": "",
  // format - output data format CSV, JSON or rows, default JSON, rows is JSON array of arrays (rows).
  "format": "json",
  // heading - text of heading to find in document that precedes desired data table, default none.
  "heading": null,
  // id - TABLE element id attribute to find in document.
  "id": "",
  // cells - minimum number of cells for a data row, default = 1-256.
  "cells": "1-256",
  // newlines - preserve new lines in cell data, default: false.
  "newlines": false,
  // trim whitespace from output values, default: true.
  "trim": true,

  //// RowAsObjectTransform options
  // headers - comma separated list of column names for data, default none. When not defined the first table row encountered will be treated as column names.
  "RowAsObject.headers": []
  // hasHeaders - data has a header row, if true and headers set then headers overrides header row.
  "RowAsObject.hasHeader": true

  //// RepeatCellTransform options
  // column - column index of cell to repeat, default 0.
  "RepeatCell.column": 0

  //// RepeatHeadingTransform options
  // header - column name for the repeating heading field. Can optionally contain suffix :m:n with index for inserting into header and data rows.
  "RepeatHeading.header": "subheading:0:0"
// hasHeaders - data has a header row, if true and headers set then headers overrides header row.
  "RepeatHeading.hasHeader": true

}
```

Note: Transform property names can be shortened to `hasHeader`, `headers`, `column` and `header`.

### Examples

```bash
hdp ./test/data/html/helloworld.html --headers="Greeting" --format=csv
```

```bash
hdp ./test/data/html/helloworld.html --id="cosmic" --headers="BigBang"
```

```bash
hdp ./test/data/html/ansi.html  --heading="Congressional Districts"
```

```bash
hdp https://www.sos.state.tx.us/elections/historical/jan2024.shtml ./test/output/hdp/tx_voter_reg.json
```

```bash
hdp --options="./test/optionsRepeatCell.json"

optionsRepeatCell.json:
{
  "url": "./test/data/html/texas_jan2024.shtml",
  "output": "./test/output/hdp/repeat_cell.json",
  "format": "json",
  "cells": 7,
  "RepeatCell.column": 0
}
```

## Developer Guide

---

### HtmlDataParser

HtmlDataParser given a HTML document will output an array of arrays (rows). Additionally, use the streaming classes PdfDataReader and RowAsObjectTransform transform to convert the arrays to Javascript objects.  With default settings HtmlDataParser will output rows in __all__ TABLE found in the document. Using [HtmlDataParser Options](#xlsx-data-parser-options) `heading` or `id` the parser can filter content to retrieve the desired data TABLE in the document.

HtmlDataParser only works on a certain subset of HTML documents specifically those that contain some TABLE elements and NOT other table like grid elements. The parser uses [isaacs/sax-js](https://github.com/isaacs/sax-js) library to transform HTML table elements into rows of cells.

Rows and Cells terminology is used instead of Rows and Columns because the content in a HTML document flows rather than strict rows/columns of database query results. Some rows may have more cells than other rows. For example a heading or description paragraph will be a row (array) with one cell (string).  See [Notes](#notes) below.

### Basic Usage

```javascript
const { HtmlDataParser } = require("xlsx-data-parser");

let parser = new HtmlDataParser({url: "filename.html"});

async function parseDocument() {
  var rows = await parser.parse();
  // process the rows
}
```

### HtmlDataParser Options

HtmlDataParser constructor takes an options object with the following fields. One of `url` or `data` arguments is required.

`{URL|string} url` - The local path or URL of the HTML document.

`{string} data` - HTML document in a string.

Common Options:

`{string|regexp} heading` - Heading, H1-H6 element, in the document after which the parser will look for a TABLE; optional, default: none. The parser does a string comparison or regexp match looking for first occurrence of `heading` value in a heading element. If neither `heading` or `id` are specified then data output contains all rows from all tables found in the document.

`{string|regexp} id` - TABLE element id attribute in the document to parse for tabular data; optional, default: none. The parser does a string comparison of the `id` value in TABLE elements ID attribute. If neither `heading` or `id` are specified then data output contains all rows from all tables found in the document.

`{number} cells` - Minimum number of cells in tabular data; optional, default: 1. The parser will NOT output rows with less than `cells` number of cells.

`{boolean} newlines` - Preserve new lines in cell data; optional, default: false. When false newlines will be replaced by spaces. Preserving newlines characters will keep the formatting of multiline text such as descriptions. Though, newlines are problematic for cells containing multi-word identifiers and keywords that might be wrapped in the cell text.

`{boolean} trim` - trim whitespace from output values, default: true.

## Streaming Usage

---

### PdfDataReader

PdfDataReader is a Node.js stream reader implemented with the Object mode option. It uses HtmlDataParser to stream one data row (array) per chunk.

```javascript
const { PdfDataReader } = require("xlsx-data-parser");

let reader = new PdfDataReader({url: "filename.html"});
var rows = [];

reader.on('data', (row) => {
  rows.push(row)
});

reader.on('end', () => {
  // do something with the rows
});

reader.on('error', (err) => {
  // log error
})
```

### PdfDataReader Options

PdfDataReader constructor options are the same as [HtmlDataParser Options](#xlsx-data-parser-options).

### RowAsObjectTransform

PdfDataReader operates in Object Mode. The reader outputs arrays (rows). To convert rows into Javascript objects use the RowAsObjectTransform transform.  PdfDataReader operates in Object mode where a chunk is a Javascript Object of <name,value> pairs.

```javascript
const { PdfDataReader, RowAsObjectTransform } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RowAsObjectTransform Options

RowAsObjectTransform constructor takes an options object with the following fields.

`{array} headers` - array of cell property names; optional, default: none. If a headers array is not specified then parser will assume the first row found contains cell property names.

`{boolean} hasHeaders` - data has a header row, if true and headers options is set then provided headers override header row. Default is true.

If a row is encountered with more cells than in the headers array then extra cell property names will be the ordinal position. For example if the data contains five cells, but only three headers where specified.  Specifying `options = { headers: [ 'name', 'type', 'info' ] }` then the Javascript objects in the stream will contain `{ "name": "value1", "type": "value2", "info": "value3", "4": "value4", "5": "value5" }`.

### RepeatCellTransform

The RepeatCellTransform will normalize data the was probably generated by a report writer. The specified cell will be repeated in following rows that contain one less cell. In the following example "Dewitt" will be repeated in rows 2 and 3.

**HTML Document**

```
County   Precincts  Date/Period   Total
Dewitt          44  JUL 2023     52,297
                44  OCT 2023     52,017
                44  JAN 2024     51,712
```

**Output**

```
[ "County", "Precincts", "Date/Period", "Total" ]
[ "Dewitt", "44", "JUL 2023", "52,297" ]
[ "Dewitt", "44", "OCT 2023", "52,017" ]
[ "Dewitt", "44", "JAN 2024", "51,712" ]
```

### Example Usage

```javascript
const { PdfDataReader, RepeatCellTransform } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RepeatCellTransform({ column: 0 });
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RepeatCellTransform Options

RepeatCellTransform constructor takes an options object with the following fields.

`{number} column` - column index of cell to repeat, default 0.

### RepeatHeadingTransform

The RepeatHeadingTransform will normalize data the was probably generated by a report writer. Subheadings are rows containing a single cell interspersed in data rows. The header name is inserted in to the header row. The subheading value will be repeated in rows that follow until another subheading is encountered. In the following example `options = {header: "County:1:0"}`.

**HTML Document**

```
District  Precincts    Total

Congressional District 5
Maricopa        120  403,741
Pinal            30  102,512
Total:          150  506,253
```

**Output**

```
[ "District", "County", "Precincts", "Total" ]
[ "Congressional District 5", "Maricopa", "120", "403,741" ]
[ "Congressional District 5", "Pinal", "30", "102,512" ]
[ "Congressional District 5", "Total:", "150", "506,253" ]
```

```javascript
const { PdfDataReader, RepeatHeadingTransform } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RepeatHeadingTransform({header: "County:1:0"});
let writable = <some writable that can handle Object Mode data>

await pipeline(reader, transform1, writable);
```

### RepeatHeadingTransform Options

RepeatHeadingTransform constructor takes an options object with the following fields.

`{string} header` - column name for the repeating heading field. Can optionally contain an index of where to insert the header in the header row. Default "heading:0".

`{boolean} hasHeaders` - data has a header row, if true and headers options is set then provided headers override header row. Default is true.

### FormatCSV and FormatJSON

The `hdpdataparser` CLI program uses the FormatCSV and FormatJSON transforms to covert Javascript Objects into strings that can be saved to a file.

```javascript
const { PdfDataReader, RowAsObjectTransform, FormatCSV } = require("xlsx-data-parser");
const { pipeline } = require('node:stream/promises');

let reader = new PdfDataReader(options);
let transform1 = new RowAsObjectTransform(options);
let transform2 = new FormatCSV();

await pipeline(reader, transform1, transform2, process.stdout);
```

## Examples

---

In the source code the xlsx-data-parser.js program and the Javascript files in the /test folder are good examples of using the library modules.

### Hello World

[HelloWorld.html](./test/data/html/helloworld.html) is a single page HTML document with the string "Hello, world!" positioned on the page. The HtmlDataParser output is one row with one cell.

```json
[
  ["Hello, world!"]
]
```

To transform the row array into an object specify the headers option to RowAsObjectTransform transform.

```javascript
let transform = new RowAsObjectTransform({
  headers: [ "Greeting" ]
})
```

Output as JSON objects:

```json
[
  { "Greeting": "Hello, world!" }
]
```

## Notes

---

* Only supports HTML files containing TABLE elements. Does not support other table like grid elements.
* Does not support identification of titles, headings, column headers, etc. by using style information for a cell.
* Vertical spanning cells are parsed with first row where the cell is encountered. Subsequent rows will not contain the cell and have one less cell. Currently, vertical spanning cells must be at the end of the row otherwise the ordinal position of cells in the following rows will be incorrect, i.e. missing values are not supported.
