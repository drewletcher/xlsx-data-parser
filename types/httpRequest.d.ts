/**
 * httpRequest
 * Takes some Axios style request config options.
 * These request options are converted to Node.js options for HTTP, HTTPS, HTTP/2
 *
 * @param {URL|String} url The absolute or relative input URL to options.
 * @param {Object} options HTTP options parameters.
 * @param {String} [options.base] URL to use as base for requests if url is relative.
 * @param {Object} [options.params] object containing URL querystring parameters.
 * @param {String} [options.httpVersion] HTTP version to use 1.0, 1.1, 2
 * @param {String} [options.method] HTTP options method, default is GET
 * @param {Number} [options.timeout] options timeout ms, default 5000ms
 * @param {Object} [options.headers] HTTP options headers
 * @param {Object} [options.cookies] array of HTTP cookies strings
 * @param {String} [options.auth] Basic authentication i.e. 'user:password' to compute an Authorization header.
 * @param {String} [options.responseType] If set to 'stream' the response will be returned when headers are received.
 * @param {Uint8Array|String} [data]
 * @returns
 */
declare function _exports(url: URL | string, options: {
    base?: string | undefined;
    params?: Object | undefined;
    httpVersion?: string | undefined;
    method?: string | undefined;
    timeout?: number | undefined;
    headers?: Object | undefined;
    cookies?: Object | undefined;
    auth?: string | undefined;
    responseType?: string | undefined;
}, data?: string | Uint8Array | undefined): Promise<any>;
declare namespace _exports {
    export { createReadStream };
}
export = _exports;
/**
 * Create an object mode readstream from the URL.
 * @param {String} url Override smt.schema with a filename in the same locus.
 * @param {Object} options http request options, see httpRequest
 * @returns a node.js readstream if successful.
*/
declare function createReadStream(url: string, options: Object): Promise<any>;
//# sourceMappingURL=httpRequest.d.ts.map