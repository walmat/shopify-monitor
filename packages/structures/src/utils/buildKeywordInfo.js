// Build a keyword info object using an incoming string
import initialKeywordInfo from '../initialStates/keywordInfo';

export default rawKeywordInfo => {
  if (!rawKeywordInfo) {
    // If null keywords are passed, return initial state
    return { ...initialKeywordInfo };
  }

  // split keywords using comma and remove whitespace
  const keywords = rawKeywordInfo.split(',').map(kw => kw.trim());

  // Ensure all keywords have a valid format
  const keywordRegex = /^([+-][a-z0-9&]+)$/;
  let failedKeyword = null;
  const keywordValidator = kw => {
    if (keywordRegex.test(kw)) {
      return true;
    }
    failedKeyword = kw;
    return false;
  };
  const allValid = keywords.every(keywordValidator);
  if (!allValid) {
    throw new Error(
      `Invalid keyword format, ensure input is a comma separated list of keywords (+<kw> or -<kw>)! Failed at: ${failedKeyword}`,
    );
  }

  // Split keywords into pos/neg arrays
  const positive = [];
  const negative = [];
  keywords.forEach(kw => {
    if (kw.startsWith('+')) {
      positive.push(kw.substr(1));
    } else {
      negative.push(kw.substr(1));
    }
  });

  // Return built keyword
  return {
    positive,
    negative,
    value: rawKeywordInfo,
  };
};
