declare const _exports: {
    new (options: any): {
        first: boolean;
        /**
         * Internal call from streamWriter to process an object
         * @param {*} row
         * @param {*} encoding
         * @param {*} callback
         */
        _transform(row: any, encoding: any, callback: any): void;
        _flush(callback: any): void;
    };
};
export = _exports;
//# sourceMappingURL=FormatJSON.d.ts.map