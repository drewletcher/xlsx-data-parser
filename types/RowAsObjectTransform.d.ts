declare const _exports: {
    new (options?: {
        hasHeader?: object | undefined;
        headers?: string[] | undefined;
    } | undefined): {
        headers: any;
        hasHeader: any;
        /**
         * Internal call from streamWriter to process an object
         * @param {*} row
         * @param {*} encoding
         * @param {*} callback
         */
        _transform(row: any, encoding: any, callback: any): void;
        _headers: any;
    };
};
export = _exports;
//# sourceMappingURL=RowAsObjectTransform.d.ts.map