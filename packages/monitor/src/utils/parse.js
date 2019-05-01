const { sortBy, flatten, map, find, filter, every, some } = require('underscore');
const { parseString } = require('xml2js');
const { isSpecialSite } = require('./siteOptions');

const ParseType = {
  Unknown: 'UNKNOWN',
  Url: 'URL',
  Keywords: 'KEYWORDS',
  Special: 'SPECIAL',
};

/**
 * Determine the type of parsing we need to
 * perform based the contents of the given
 *
 * @param {Object} product
 */
function getParseType(keywords, site) {
  console.log('determining %s parsing type: %j', site.url, keywords);
  if (!keywords) {
    return ParseType.Unknown;
  }

  if (site && isSpecialSite(site)) {
    console.log('special');
    return ParseType.Special;
  }

  if (keywords.url) {
    console.log('url');
    return ParseType.Url;
  }

  if (keywords.positive && keywords.negative) {
    console.log('keywords');
    return ParseType.Keywords;
  }

  return ParseType.Unknown;
}

/**
 * Filter a list using a sorter and limit
 *
 * Using a given sorter, sort the list and then limit
 * the array by the given limit. The sorter can be a
 * String that is the key to use on each object (e.g. length),
 * or a function that takes an object from the list and
 * returns a value to use when sorting. No sorting will take
 * place if no sorter is given.
 *
 * Limiting can be done in "ascending" or "descending" mode
 * based on the sign of the limit. When using a positive number,
 * the first N values will be chosen ("ascending"). When using
 * a negative number, the last N values will be chosen ("descending").
 * No limiting will take place if 0 or no limit is given.
 *
 * @param {List} list the list to filter
 * @param {Sorter} sorter the method of sorting
 * @param {num} limit the limit to use
 */
function filterAndLimit(list, sorter, limit) {
  if (!list) {
    return [];
  }
  let sorted = list;
  if (sorter) {
    sorted = sortBy(list, sorter);
  }

  const _limit = limit || 0;
  if (_limit === 0) {
    return sorted;
  }
  if (_limit > 0) {
    return sorted.slice(_limit);
  }
  // slice, then reverse elements to get the proper order
  return sorted.slice(0, _limit).reverse();
}

/**
 * Match a variant id to a product
 *
 * Take the given list of products and find the product
 * that contains the given varient id. If no product is
 * found, this method returns `null`.
 *
 * NOTE:
 * This method assumes the following:
 * - The products list contains objects that have a "variants" list of
 *   variants associated with the product
 * - The variant objects contain an id for the variant and a "product_id" key
 *   that maps it back to the associated product
 *
 * @param {List} products list of products to search
 * @param {String} variantId the variant id to match
 */
function matchVariant(products, variantId) {
  if (!products) {
    return null;
  }
  if (!variantId) {
    return null;
  }
  // Sometimes the objects in the variants list don't include a product_id hook back to the associated product.
  // In order to counteract this, we first add this hook in (if it doesn't exist)
  const transformedProducts = products.map(({ id, variants, ...otherProductData }) => {
    const transformedVariants = variants.map(({ product_id: productId, ...otherVariantData }) => ({
      ...otherVariantData,
      product_id: productId || id,
    }));
    return {
      ...otherProductData,
      id,
      variants: transformedVariants,
    };
  });

  // Step 1: Map products list to a list of variant lists
  // Step 2: flatten the list of lists, so we only have one total list of all variants
  // Step 3: Search for the variant in the resulting variant list
  const matchedVariant = find(
    flatten(map(transformedProducts, p => p.variants)),
    v => v.id.toString() === variantId,
  );
  if (matchedVariant) {
    return find(transformedProducts, p => p.id === matchedVariant.product_id);
  }
  return null;
}

/**
 * Match a set of keywords to a product
 *
 * Given a list of products, use a set of keywords to find a
 * single product that matches the following criteria:
 * - the product's title/handle contains ALL of the positive keywords (`keywords.pos`)
 * - the product's title/handle DOES NOT contain ANY of the negative keywords (`keywords.neg`)
 *
 * If no product is found, `null` is returned. If multiple products are found,
 * the products are filtered using the given `filter.sorter` and `filter.limit`.
 * and the first product is returned.
 *
 * If no filter is given, this method returns the most recent product.
 *
 * See `filterAndLimit` for more details on `sorter` and `limit`.
 *
 * @param {List} products list of products to search
 * @param {Object} keywords an object containing two arrays of strings (`pos` and `neg`)
 * @see filterAndLimit
 */
function matchKeywords(products, keywords, fil, returnAll = true) {
  if (!products) {
    return null;
  }
  if (!keywords) {
    return null;
  }
  if (!keywords.pos || !keywords.neg) {
    return null;
  }

  const matches = filter(products, product => {
    const title = product.title.toUpperCase();
    const rawHandle = product.handle || '';
    const handle = rawHandle.replace(new RegExp('-', 'g'), ' ').toUpperCase();

    // defaults
    let pos = true;
    let neg = false;

    // match every keyword in the positive array
    if (keywords.pos.length > 0) {
      pos = every(
        keywords.pos.map(k => k.toUpperCase()),
        keyword => title.indexOf(keyword.toUpperCase()) > -1 || handle.indexOf(keyword) > -1,
      );
    }

    // match none of the keywords in the negative array
    if (keywords.neg.length > 0) {
      neg = some(
        keywords.neg.map(k => k.toUpperCase()),
        keyword => title.indexOf(keyword) > -1 || handle.indexOf(keyword) > -1,
      );
    }
    return pos && !neg;
  });

  if (!matches.length) {
    return null;
  }
  if (matches.length > 1) {
    let filtered;
    if (fil && fil.sorter && fil.limit) {
      let { limit } = fil;
      if (returnAll) {
        limit = 0;
      }
      filtered = filterAndLimit(matches, fil.sorter, limit, this._logger);
      if (!returnAll) {
        return filtered[0];
      }
      return filtered;
    }
    if (returnAll) {
      return filterAndLimit(matches, 'updated_at', 0, this._logger);
    }
    return filterAndLimit(matches, 'updated_at', -1, this._logger)[0];
  }
  return returnAll ? matches : matches[0];
}

/**
 * Convert an XML String to JSON
 *
 * This method proxies the xml2js parseString method,
 * but converts it to a promisified form.
 *
 * @param {String} xml
 */
function convertToJson(xml) {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(result);
    });
  });
}

module.exports = {
  ParseType,
  getParseType,
  filterAndLimit,
  matchVariant,
  matchKeywords,
  convertToJson,
};
