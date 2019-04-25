/* eslint-disable class-methods-use-this */
const SpecialParser = require('./specialParser');
const { ParseType, matchKeywords } = require('../monitor/parse');
const { ErrorCodes } = require('../utils/constants').Utils;

/**
 * Base Special Parser for all DSM Sites
 */
class DsmParser extends SpecialParser {
  constructor(request, data, proxy, name = 'DsmParser') {
    super(request, data, proxy, name);
  }

  // eslint-disable-next-line class-methods-use-this
  get initialPageContainsProducts() {
    return false;
  }

  async parseInitialPageForUrls($) {
    // Look for all `.grid-view-item`'s
    const parsedItems = [];
    $('.grid-view-item').each((i, el) => {
      const link = $('.grid-view-item__link', el).attr('href');
      const title = $('.grid-view-item__title', el).text();

      if (!link || !title) {
        return;
      }
      parsedItems.push({ link, title });
    });

    let items = parsedItems;
    // If parsing keywords, reduce the number of pages to search by matching the title
    if (this._type === ParseType.Keywords && items.length !== 0) {
      const keywords = {
        pos: this._data.product.pos_keywords,
        neg: this._data.product.neg_keywords,
      };
      items = matchKeywords(parsedItems, keywords, null, null, true) || [];
    }

    if (!items.length) {
      const error = new Error('No Items Found');
      error.status = ErrorCodes.ProductNotFound;
      throw error;
    }

    // Convert items to full urls
    const productUrls = items.map(({ link }) => new URL(link, this._data.site.url).href);

    return productUrls;
  }

  async parseProductInfoPageForProduct($) {
    // Look for the script tag containing the product json
    const product = $('script#ProductJson-product-template');
    if (!product || product.attr('type') !== 'application/json') {
      const error = new Error('No Items Found');
      error.status = ErrorCodes.ProductNotFound;
      throw error;
    }

    return JSON.parse(product.html());
  }

  async run() {
    const matchedProduct = await super.run();
    return matchedProduct;
  }
}

module.exports = DsmParser;
