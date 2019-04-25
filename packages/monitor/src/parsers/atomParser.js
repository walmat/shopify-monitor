const Parser = require('./parser');
const { ParseType, convertToJson } = require('../monitor/parse');
const { format, userAgent } = require('../utils/constants').Utils;

class AtomParser extends Parser {
  /**
   * Construct a new AtomParser
   *
   * @param {Object} data the data we want to parse and match
   * @param {Proxy} the proxy to use when making requests
   * @param {Logger} (optional) A logger to log messages to
   */
  constructor(request, data, proxy) {
    super(request, data, proxy, 'AtomParser');
  }

  async run() {
    if (this._type !== ParseType.Keywords) {
      throw new Error('Atom parsing is only supported for keyword searching');
    }
    let responseJson;
    try {
      const response = await this._request({
        method: 'GET',
        uri: `${this._data.site.url}/collections/all.atom`,
        proxy: format(this._proxy) || undefined,
        rejectUnauthorized: false,
        json: false,
        simple: true,
        gzip: true,
        headers: {
          'User-Agent': userAgent,
        },
      });
      responseJson = await convertToJson(response);
    } catch (error) {
      const rethrow = new Error('unable to make request');
      rethrow.status = error.statusCode || 404; // Use the status code, or a 404 if no code is given
      throw rethrow;
    }

    const responseItems = responseJson.feed.entry;
    const products = responseItems.map(item => ({
      id_raw: item.id[0],
      id: item.id[0].substring(item.id[0].lastIndexOf('/') + 1),
      url: item.link[0].$.href,
      updated_at: item.updated[0],
      title: item.title[0],
      handle: '-',
    }));
    const matchedProduct = super.match(products);

    if (!matchedProduct) {
      const rethrow = new Error('unable to match the product');
      rethrow.status = 500; // Use a bad status code
      throw rethrow;
    }
    let fullProductInfo = null;
    try {
      fullProductInfo = await Parser.getFullProductInfo(
        matchedProduct.url,
        this._request,
        this._logger,
      );
      return {
        ...matchedProduct,
        ...fullProductInfo,
        url: matchedProduct.url, // Use known good product url
      };
    } catch (errors) {
      const rethrow = new Error('unable to get full product info');
      rethrow.status = 500; // Use a bad status code
      throw rethrow;
    }
  }
}
module.exports = AtomParser;
