const getCurrencyForSite = ({ name }) => {
  const _name = name.toUpperCase();
  switch (_name) {
    case _name.indexOf('DSM UK') > -1: {
      return 'GBP';
    }
    case _name.indexOf('DSM SG') > -1: {
      return 'SGD';
    }
    case _name.indexOf('DSM JP') > -1: {
      return 'JPY';
    }
    case _name.indexOf('HAVEN') > -1: {
      return 'CAD';
    }
    case _name.indexOf('BBC ICE CREAM EU') > -1: {
      return 'GBP';
    }
    case _name.indexOf('LIVESTOCK') > -1: {
      return 'CAD';
    }
    case _name.indexOf('NRML') > -1: {
      return 'CAD';
    }
    case _name.indexOf('NOIRFONCE') > -1: {
      return 'EUR';
    }
    case _name.indexOf('OCTOBERS VERY OWN UK') > -1: {
      return 'GBP';
    }
    case _name.indexOf('OFF THE HOOK') > -1: {
      return 'CAD';
    }
    case _name.indexOf('PALACE UK') > -1: {
      return 'GBP';
    }
    case _name.indexOf('PALACE JP') > -1: {
      return 'JPY';
    }
    case _name.indexOf('PLACES+FACES') > -1: {
      return 'GBP';
    }
    case _name.indexOf('STONE ISLAND') > -1: {
      return 'GBP';
    }
    case _name.indexOf('SUEDE STORE') > -1: {
      return 'EUR';
    }
    case _name.indexOf('HANON') > -1: {
      return 'GBP';
    }
    case _name.indexOf('GOOD AS GOLD') > -1: {
      return 'NZD';
    }
    default: {
      return 'USD';
    }
  }
};

module.exports = {
  getCurrencyForSite,
};
