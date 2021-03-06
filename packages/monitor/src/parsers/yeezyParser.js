/* eslint-disable class-methods-use-this */
const SpecialParser = require('./specialParser');
const { ErrorCodes } = require('../utils/constants').Utils;

class YeezyParser extends SpecialParser {
  constructor(request, data, proxy) {
    super(request, data, proxy, 'YeezyParser');
  }

  // eslint-disable-next-line class-methods-use-this
  get initialPageContainsProducts() {
    return true;
  }

  parseInitialPageForProducts($) {
    // Look for all `.js-product-json`'s
    const products = [];

    const validateArray = (arr = [], errorCode = ErrorCodes.ProductNotFound) => {
      if (arr.length === 0) {
        const error = new Error('No Items Found');
        error.status = errorCode;
        throw error;
      }
    };

    const parseTag = el => {
      if (el.attr('type') !== 'application/json') {
        return;
      }

      try {
        const html = el.html();
        const product = JSON.parse(html);
        products.push(product);
      } catch (err) {
        // fail silently...
      }
    };

    const scriptTags = $('script.js-product-json');
    validateArray(scriptTags);
    if (scriptTags.length === 1) {
      // scriptTags is the only element, parse it
      parseTag(scriptTags);
    } else {
      // scriptTags has multiple elements, parse each one
      scriptTags.each((_, el) => {
        parseTag($(el));
      });
    }

    validateArray(products);

    // check to see if product is live yet
    const liveAvailableProducts = products.filter(
      ({ type }) => type.toUpperCase().indexOf('PLACEHOLDER') === -1,
    );
    validateArray(liveAvailableProducts, ErrorCodes.ProductNotLive);

    const validatedProducts = liveAvailableProducts.filter(
      ({ id, title, handle, variants }) => id && variants && (title || handle),
    );

    validateArray(validatedProducts);

    return validatedProducts;
  }

  parseProductInfoPageForProduct($) {
    // Proxy the initial page parsing since it works for product pages as well...
    const [matchedProduct] = YeezyParser.parseInitialPageForProducts($);
    return matchedProduct;
  }
}

module.exports = YeezyParser;
