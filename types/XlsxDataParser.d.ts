export = XlsxDataParser;
declare class XlsxDataParser {
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
    constructor(options?: {
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
        trim: boolean;
    } & {
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
    worksheet: Object | undefined;
    missingCells: boolean | undefined;
    cells: {
        min: number;
        max: number;
        heading: number;
    };
    rows: any[];
    count: number;
    headingFound: boolean;
    tableFound: boolean;
    tableDone: boolean;
    started: boolean;
    paused: boolean;
    cancelled: boolean;
    /**
     * Parse the worksheet cells.
     * @returns Rows an array containing arrays of data values.
     * If using an event listener the return value will be an empty array.
     */
    parse(): Promise<any[]>;
    workbook: XLSX.WorkBook | undefined;
    topLeft: {
        column: any;
        row: any;
    } | undefined;
    bottomRight: {
        column: any;
        row: any;
    } | undefined;
    entries: any;
    pos: number | undefined;
    len: any;
    prevAddress: {
        column: any;
        row: any;
    } | undefined;
    row: any[] | undefined;
    pause(): void;
    resume(): void;
    cancel(): void;
    /**
     * Iterate the cells and determine rows.
     */
    parseCells(): Promise<void>;
    getAddress(a1_address: any): {
        column: any;
        row: any;
    };
    /**
     * determines if a1 is above-left of or equal to a2
     * @param {*} a1
     * @param {*} a2
     * @returns
     */
    compareAddress(a1: any, a2: any): boolean;
    inRange(address: any): boolean;
    ltCol(col1: any, col2: any): boolean;
    lteCol(col1: any, col2: any): boolean;
    incCol(col: any): string;
    /**
     *
     * @param {*} rowlen
     * @returns
     */
    inCellRange(rowlen: any): boolean;
    /**
     * Performs row filtering.
     *
     * @param {*} row is an array of data values
     * @returns {Boolean} row passed filtering checks
     */
    examine(row: any): boolean;
    _headersRow: any;
    /**
     * Emits or appends data to output.
     *
     * @param {*} row is an array of data values
     */
    output(row: any): Promise<void>;
    /**
    *
    * @param {Object} row - the row to check
    * @param {String} heading - text to compare against
    */
    compareHeading(row: Object, heading: string): any;
    rowsEqual(row1: any, row2: any): boolean;
}
import XLSX = require("xlsx");
//# sourceMappingURL=XlsxDataParser.d.ts.map