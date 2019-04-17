const { ErrorCodes } = require('../constants').Utils;

function generateAvailableVariants(product) {
  // Filter out unavailable variants first
  const availableVariants = product.variants.filter(v => v.available);
  if (!availableVariants.length) {
    const err = new Error('No variants available');
    err.code = ErrorCodes.VariantsNotAvailable;
    throw err;
  }

  return availableVariants;
}

module.exports = {
  generateAvailableVariants,
};
