const Parser = require('./parser');
const { convertToJson } = require('../utils/parse');
const { format, userAgent } = require('../utils/constants').Utils;

class AtomParser extends Parser {
  /**
   * Construct a new AtomParser
   *
   * @param {Object} data the data we want to parse and match
   * @param {Proxy} proxy proxy to use when making requests
   * @param {Logger} (optional) A logger to log messages to
   */
  constructor(request, data, proxy) {
    super(request, data, proxy, 'AtomParser');
  }

  async run() {
    const { url } = this._data.site;

    let responseJson;
    try {
      const response = await this._request({
        method: 'GET',
        uri: `${url}/collections/all.atom`,
        proxy: format(this._proxy),
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
      throw new Error('unable to match the product');
    }

    const fullProductsInfo = [];
    try {
      matchedProducts.forEach(product => {
        const info = Parser.getFullProductInfo(product.url, this._request);

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
