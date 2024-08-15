
/**
 * lib/XlsxDataReader
 */
"use strict";

const XlsxDataParser = require("./XlsxDataParser");
const { Readable } = require('stream');

module.exports = class XlsxDataReader extends Readable {

  /**
   *
   * @param {Object}     options
   * @param {String|URL} [options.url]           the URL or local file name of the .xlsx file
   * @param {Object}     [options.worksheet]     XLSX worksheet object with cell properties
   * @param {String}   [options.sheetName]     name of worksheet in workbook, default 1st worksheet
   * @param {String}   [options.range]         data selection, A1-style range, e.g. "A3:M24", default all rows/columns
   * @param {Number|String} [options.cells]    minimum number cells in a row for output, or "min-max" e.g. "7-9"
   * @param {Boolean}  [options.missingCells]  insert null values for missing cells
   * @param {String}   [options.heading]       PDF section heading or text before data table, default: none
   * @param {String}   [options.stopHeading]   PDF section heading or text after data table, default: none
   * @param {Boolean}  [options.repeating]     indicates if table headers are repeated on each page, default: false
   * @param {Boolean}  [options.trim]          trim cell values, default true
   * @param {Boolean}  [options.raw]           read raw cell properties, default false
   * @param {Object}   [options.xlsx]          options to pass thru to XLSX
   * @param {Object}   [options.http]          options ot pass thru to HTTP request
   */
  constructor(options) {
    let streamOptions = {
      objectMode: true,
      highWaterMark: 16,
      autoDestroy: false
    };
    super(streamOptions);

    this.options = options || {};
    this.parser;
  }

  cancel() {
    this.parser.cancel();
  }

  async _construct(callback) {
    let parser = this.parser = new XlsxDataParser(this.options);
    var reader = this;

    parser.on('data', (row) => {
      // console.debug("XlxsDataReader push");
      if (row) {
        if (!reader.push(row)) {
          parser.pause();  // If push() returns false stop reading from source.
        }
      }
    });

    parser.on('end', () => {
      reader.push(null);
    });

    parser.on('error', (err) => {
      console.error(err);
      //throw err;
    });

    callback();
  }

  /**
   * Fetch data from the underlying resource.
   * @param {*} size <number> Number of bytes to read asynchronously
   */
  async _read(size) {
    // ignore size
    try {
      if (!this.parser.started)
        this.parser.parse();
      else
        this.parser.resume();
    }
    catch (err) {
      this.push(null);
    }
  }

};
