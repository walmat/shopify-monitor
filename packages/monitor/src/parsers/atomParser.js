const Parser = require('./parser');
const { ParseType, convertToJson } = require('../utils/parse');
const { format, userAgent } = require('../utils/constants').Utils;

class AtomParser extends Parser {
  /**
   * Construct a new AtomParser
   *
   * @param {Object} data the data we want to parse and match
   * @param {Proxy} the proxy to use when making requests
   * @param {Logger} (optional) A logger to log messages to
   */
  constructor(request, site, data, proxy) {
    super(request, site, data, proxy, 'AtomParser');
  }

  async run() {
    if (this._type !== ParseType.Keywords) {
      throw new Error('Atom parsing is only supported for keyword searching');
    }

    const { url } = this._site;

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
    if (!responseItems || !responseItems.length) {
      const rethrow = new Error('No Products Found');
      rethrow.status = 404;
      throw rethrow;
    }
    const products = responseItems.map(item => ({
      id_raw: item.id[0],
      id: item.id[0].substring(item.id[0].lastIndexOf('/') + 1),
      url: item.link[0].$.href,
      updated_at: item.updated[0],
      title: item.title[0],
      handle: '-',
    }));
    const matchedProducts = super.match(products);

    if (!matchedProducts) {
      const rethrow = new Error('unable to match the product');
      rethrow.status = 500; // Use a bad status code
      throw rethrow;
    }
    const fullProductsInfo = [];
    try {
      await matchedProducts.forEach(async product => {
        const info = await Parser.getFullProductInfo(product.url, this._request);

        if (!info) {
          // TODO: should we throw here?
          throw new Error('Unable to get full product info!');
        }
        fullProductsInfo.push(info);
      });

      return fullProductsInfo;
    } catch (errors) {
      const rethrow = new Error('Failed getting full product info!');
      rethrow.status = 500; // Use a bad status code
      throw rethrow;
    }
  }
}
module.exports = AtomParser;
