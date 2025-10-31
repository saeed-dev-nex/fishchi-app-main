import moment from 'moment-jalaali';

function convertYearBasedOnLanguage(year, language) {
  // Check for null, undefined, empty string, or zero
  if (
    !year ||
    year === null ||
    year === undefined ||
    year === '' ||
    year === 0
  ) {
    return null;
  }

  // Convert to number if it's a string
  const numericYear = typeof year === 'string' ? parseInt(year, 10) : year;

  // Check if the conversion resulted in a valid number
  if (isNaN(numericYear) || numericYear <= 0) {
    return null;
  }

  if (language === 'persian') {
    // Convert Gregorian year to Persian year
    const gregorianDate = moment(`${numericYear}-01-01`, 'YYYY-MM-DD');
    const persianYear = gregorianDate.jYear();
    return persianYear;
  } else {
    // For English sources, keep the year as is (Gregorian)
    return numericYear;
  }
}

console.log('Testing convertYearBasedOnLanguage after complete fix...');
console.log('English 2024:', convertYearBasedOnLanguage(2024, 'english'));
console.log('Persian 2024:', convertYearBasedOnLanguage(2024, 'persian'));
console.log('Persian 1396:', convertYearBasedOnLanguage(1396, 'persian'));
console.log('Null year:', convertYearBasedOnLanguage(null, 'persian'));
console.log(
  'Undefined year:',
  convertYearBasedOnLanguage(undefined, 'persian')
);
console.log('Empty string:', convertYearBasedOnLanguage('', 'persian'));
console.log('Zero:', convertYearBasedOnLanguage(0, 'persian'));
console.log('String year:', convertYearBasedOnLanguage('2024', 'persian'));
console.log('Invalid string:', convertYearBasedOnLanguage('abc', 'persian'));
