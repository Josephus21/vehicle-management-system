// src/utils/isMarkdownTable.js

export const isMarkdownTable = (text) => {
  const tableStart = /^\s*\|.*\|\s*$/m;
  const tableSeparator = /^\s*\|?[-:]+\|[-:]+\|?$/m;
  return tableStart.test(text) && tableSeparator.test(text);
};
