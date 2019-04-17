/* eslint-disable class-methods-use-this */
const DsmParser = require('./dsmParser');

class DsmUsParser extends DsmParser {
  constructor(request, task, proxy) {
    super(request, task, proxy, 'DsmUsParser');
  }

  parseProductInfoPageForHash($) {
    const regex = /\$\(\s*atob\(\s*'PGlucHV0IHR5cGU9ImhpZGRlbiIgbmFtZT0icHJvcGVydGllc1tfSEFTSF0iIC8\+'\s*\)\s*\)\s*\.val\(\s*'(.+)'\s*\)/;
    if (!regex) {
      return null;
    }
    try {
      const hashes = [];
      $('#MainContent > script').each((i, e) => {
        // should match only one, but just in case, let's loop over all possibilities
        if (e.children) {
          // check to see if we can find the hash property
          const elements = regex.exec(e.children[0].data);
          if (elements) {
            hashes.push(elements[1]);
          }
        }
      });
      switch (hashes.length) {
        case 0: {
          return null;
        }
        case 1: {
          const [hash] = hashes;
          return hash;
        }
        default: {
          const [hash] = hashes;
          return hash;
        }
      }
    } catch (err) {
      return null;
    }
  }
}

module.exports = DsmUsParser;
