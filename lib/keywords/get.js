const stopWords = require('./stopwords');

module.exports = function(text, count = 10) {
  // Prepare text
  text = text.replace(/\s/g, ' ');
  text = text.toLowerCase();
  text = text.replace(/[^a-zA-Z0-9äöüß]/g, ' ');

  // Remove stopwords
  stopWords.forEach(sw => {
    text = text.replace(` ${sw} `, ' ');
  });

  let words = text.split(' '),
    keywords = {};

  // Count how many times each word appears
  words.forEach((word, i) => {
    if (word.length <= 3) return;

    word = word.trim();

    if (keywords[word] !== undefined) keywords[word] + 1;
    else keywords[word] = 1;
  });

  let keywordSort = Object.keys(keywords).map(kw => {
    return [kw, keywords[kw]];
  });

  // Sort by how often keyword is used
  keywordSort.sort((a, b) => {
    if (a[1] < b[1]) return -1;
    else return 1;
  });

  return keywordSort.slice(0, count).map(kw => kw[0]);
};
