export = XlsxDataReader;
declare class XlsxDataReader {
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
    constructor(options: {
        url?: string | URL | undefined;
        worksheet?: Object | undefined;
        sheetName?: string | undefined;
        range?: string | undefined;
        cells?: string | number | undefined;
        missingCells?: boolean | undefined;
        heading?: string | undefined;
        stopHeading?: string | undefined;
        repeating?: boolean | undefined;
        trim?: boolean | undefined;
        raw?: boolean | undefined;
        xlsx?: Object | undefined;
        http?: Object | undefined;
    });
    options: {
        url?: string | URL | undefined;
        worksheet?: Object | undefined;
        sheetName?: string | undefined;
        range?: string | undefined;
        cells?: string | number | undefined;
        missingCells?: boolean | undefined;
        heading?: string | undefined;
        stopHeading?: string | undefined;
        repeating?: boolean | undefined;
        trim?: boolean | undefined;
        raw?: boolean | undefined;
        xlsx?: Object | undefined;
        http?: Object | undefined;
    };
    _construct(callback: any): Promise<void>;
    parser: XlsxDataParser | undefined;
    /**
     * Fetch data from the underlying resource.
     * @param {*} size <number> Number of bytes to read asynchronously
     */
    _read(size: any): Promise<void>;
}
import XlsxDataParser = require("./XlsxDataParser");
//# sourceMappingURL=XlsxDataReader.d.ts.map