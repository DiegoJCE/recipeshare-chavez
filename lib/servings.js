const vulgarFractions = {
  '¼': '1/4', '½': '1/2', '¾': '3/4', '⅓': '1/3', '⅔': '2/3',
  '⅛': '1/8', '⅜': '3/8', '⅝': '5/8', '⅞': '7/8',
};
const fractionChars = Object.keys(vulgarFractions).join('');
const amount = String.raw`(?:\d*\s?[${fractionChars}]|\d+\s+\d+\/\d+|\d+\/\d+|\d*\.\d+|\d+)`;
const leadingAmount = new RegExp(`^(${amount})(?:\\s*([-–])\\s*(${amount}))?(?=\\s|$)`);
const formatAmount = new Intl.NumberFormat('en-US', { useGrouping: false, maximumSignificantDigits: 4 });

function readAmount(text) {
  return text.replace(new RegExp(`[${fractionChars}]`), (fraction) => ` ${vulgarFractions[fraction]}`)
    .trim().split(/\s+/).reduce((sum, part) => {
    const [numerator, denominator = 1] = part.split('/');
    return sum + numerator / denominator;
  }, 0);
}

export function scaleIngredient(ingredient, original, target) {
  if (!Number.isSafeInteger(original) || !Number.isSafeInteger(target) ||
      original < 1 || target < 1 || original === target) return ingredient;

  const match = ingredient.match(leadingAmount);
  if (!match) return ingredient;

  const [quantity, first, separator, last] = match;
  const amounts = (last ? [first, last] : [first]).map((value) => readAmount(value) * target / original);
  if (!amounts.every(Number.isFinite)) return ingredient;

  return amounts.map((value) => formatAmount.format(value)).join(separator || '') + ingredient.slice(quantity.length);
}
