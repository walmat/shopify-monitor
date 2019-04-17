/* eslint-disable class-methods-use-this */
const SpecialParser = require('../specialParser');
const { ParseType, matchKeywords } = require('../../monitor/parse');
const { ErrorCodes } = require('../../constants').Utils;

/**
 * Base Special Parser for all DSM Sites
 */
class DsmParser extends SpecialParser {
  constructor(request, task, proxy, name = 'DsmParser') {
    super(request, task, proxy, name);

    /**
     * Some Dsm Sites requires specific hashes to be attached when adding
     * to cart. We store all parsed hashes in a map (keyed by product id)
     * so they can be used. By default, this map is not used, but
     * subclasses can extend this class and add support in the following ways:
     *
     * 1. implementing parseInitialPageForHash($) - this method receives the
     *    initial page loaded with cheerio and expects a hash to be returned.
     *    The hash is set as the default hash for all products unless they are
     *    set specifically for a product
     * 2. implementing parseProductPageForHash($) - this method receives the
     *    product page loaded with cheerio and expects a hash to be returned.
     *    The hash is set for that product's id. If the matched product has an
     *    id stored for it through this method, it is used, then the default hash
     *    is used and finally the backup hash is used.
     */
    this._hashIds = {};
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
        pos: this._task.product.pos_keywords,
        neg: this._task.product.neg_keywords,
      };
      items = matchKeywords(parsedItems, keywords, null, null, true) || [];
    }

    if (!items.length) {
      // If no products are found, throw an error, but specify a special status to stop the task
      // TODO: Maybe replace with a custom error object?
      const error = new Error('No Items Found');
      error.status = ErrorCodes.ProductNotFound;
      throw error;
    }

    // Convert items to full urls
    const productUrls = items.map(({ link }) => new URL(link, this._task.site.url).href);

    // Parse for hash
    const hash = await this.parseInitialPageForHash($);
    if (hash) {
      this._hashIds.__default__ = hash;
    }

    return productUrls;
  }

  parseInitialPageForHash() {
    return null;
  }

  async parseProductInfoPageForProduct($) {
    // Look for the script tag containing the product json
    const product = $('script#ProductJson-product-template');
    if (!product || product.attr('type') !== 'application/json') {
      // If no products are found, throw an error, but specify a special status to stop the task
      // TODO: Maybe replace with a custom error object?
      const error = new Error('No Items Found');
      error.status = ErrorCodes.ProductNotFound;
      throw error;
    }

    const parsedProduct = JSON.parse(product.html());

    // Calcalate and store hash for this product
    const hash = await this.parseProductInfoPageForHash($, this._task.site);
    if (hash) {
      this._hashIds[parsedProduct.id] = hash;
    }

    return parsedProduct;
  }

  parseProductInfoPageForHash() {
    return null;
  }

  async run() {
    const matchedProduct = await super.run();

    // Check for hash and store it before returning
    const hash = this._hashIds[matchedProduct.id] || this._hashIds.__default__;
    if (hash) {
      this._task.product.hash = hash;
    }

    return matchedProduct;
  }
}

module.exports = DsmParser;
