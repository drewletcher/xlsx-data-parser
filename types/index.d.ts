export const XlsxDataParser: {
    new (options?: {
        url: URL | string;
        worksheet: object;
        sheetName?: string | undefined;
        range?: string | undefined;
        cells?: string | number | undefined;
        missingCells?: boolean | undefined;
        heading?: string | undefined;
        stopHeading?: string | undefined;
        repeating?: boolean | undefined;
        trim?: boolean | undefined;
        raw?: boolean | undefined;
        xlsx?: object | undefined;
        http?: object | undefined;
    }): import("./XlsxDataParser.js");
};
export const XlsxDataReader: {
    new (options: {
        url: URL | string;
        worksheet: object;
    }): import("./XlsxDataReader.js");
};
export const RowAsObjectTransform: {
    new (options?: {
        hasHeader?: object | undefined;
        headers?: string[] | undefined;
    } | undefined): {
        headers: any;
        hasHeader: any;
        _transform(row: any, encoding: any, callback: any): void;
        _headers: any;
    };
};
export const RepeatCellTransform: {
    new (options?: {
        column?: number | undefined;
    } | undefined): {
        column: any;
        repeatValue: string;
        prevLen: number;
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export const RepeatHeadingTransform: {
    new (options?: {
        header?: string | undefined;
        hasHeader?: boolean | undefined;
    } | undefined): {
        header: any;
        headerIndex: any;
        dataIndex: any;
        hasHeader: any;
        subHeading: string;
        count: number;
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export const FormatCSV: {
    new (options: any): {
        first: boolean;
        _transform(row: any, encoding: any, callback: any): void;
    };
};
export const FormatJSON: {
    new (options: any): {
        first: boolean;
        _transform(row: any, encoding: any, callback: any): void;
        _flush(callback: any): void;
    };
};
//# sourceMappingURL=index.d.ts.map