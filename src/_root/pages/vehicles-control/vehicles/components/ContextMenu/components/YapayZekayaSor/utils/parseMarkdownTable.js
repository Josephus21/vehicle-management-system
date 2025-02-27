export const parseMarkdownTable = (markdown) => {
  const lines = markdown.trim().split("\n");

  // Tablonun başlangıç noktasını bul
  let tableStartIndex = lines.findIndex((line) => line.startsWith("|"));

  if (tableStartIndex === -1) {
    return null; // Tablo bulunamadı
  }

  // Tablonun bitiş noktasını bul
  let tableEndIndex = lines.length;
  for (let i = tableStartIndex; i < lines.length; i++) {
    if (!lines[i].startsWith("|")) {
      tableEndIndex = i;
      break;
    }
  }

  const tableLines = lines.slice(tableStartIndex, tableEndIndex).join("\n");

  const tableLinesSplit = tableLines.split("\n");

  if (tableLinesSplit.length < 2) {
    return null; // Tablo için yeterli satır yok
  }

  // İlk satır başlıkları içerir
  const headers = tableLinesSplit[0]
    .split("|")
    .map((header) => header.trim())
    .filter((header) => header);

  // İkinci satır ayrıcıdır, atlanır
  const dataLines = tableLinesSplit.slice(2);

  // Verileri işleme
  const data = dataLines.map((line, index) => {
    const values = line
      .split("|")
      .map((value) => value.trim().replace(/\*\*(.*?)\*\*/g, "$1"))
      .filter((value) => value);
    const row = {};
    headers.forEach((header, i) => {
      row[header] = values[i] || "";
    });
    row.key = index; // Ant Design Table için unique key
    return row;
  });

  // Ant Design Table için sütunlar
  const columns = headers.map((header) => ({
    title: header,
    dataIndex: header,
    key: header,
  }));

  return { columns, data };
};
