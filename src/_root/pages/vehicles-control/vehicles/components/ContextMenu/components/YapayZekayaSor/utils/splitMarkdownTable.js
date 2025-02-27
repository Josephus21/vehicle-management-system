export const splitMarkdownTable = (markdown) => {
  const lines = markdown.trim().split("\n");

  let tableStartIndex = -1;
  let tableEndIndex = -1;

  // Tablonun başlangıç noktasını bul
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("|")) {
      tableStartIndex = i;
      break;
    }
  }

  if (tableStartIndex === -1) {
    return { before: markdown, table: null, after: null };
  }

  // Tablonun bitiş noktasını bul
  for (let i = tableStartIndex; i < lines.length; i++) {
    if (!lines[i].startsWith("|")) {
      tableEndIndex = i;
      break;
    }
  }

  if (tableEndIndex === -1) {
    tableEndIndex = lines.length;
  }

  const tableLines = lines.slice(tableStartIndex, tableEndIndex).join("\n");
  const beforeLines = lines.slice(0, tableStartIndex).join("\n");
  const afterLines = lines.slice(tableEndIndex).join("\n");

  return { before: beforeLines.trim(), table: tableLines.trim(), after: afterLines.trim() };
};
