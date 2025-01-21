const fs = require("fs");
const pdfParse = require("pdf-parse");

async function extractDataFromPDF(pdfPath) {
  try {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfData = await pdfParse(pdfBuffer);
    const text = pdfData.text;

    const lafIdMatch = text.match(/LAF-ID[:\s]+([^\n\s]+)/i);
    const auftragsnummerMatch = text.match(/Auftragsnummer[:\s]+([^\n\s]+)/i);
    const kennzeichenMatch = text.match(/Kennzeichen[:\s]+([^\n\s]+)/i);

    const lafId = lafIdMatch ? lafIdMatch[1] : null;
    const auftragsnummer = auftragsnummerMatch ? auftragsnummerMatch[1] : null;
    const kennzeichen = kennzeichenMatch ? kennzeichenMatch[1] : null;

    // Проверяем, что все три значения найдены
    if (lafId && auftragsnummer && kennzeichen) {
      return { lafId, auftragsnummer, kennzeichen };
    } else {
      return null; // Если хотя бы одно значение не найдено
    }
  } catch (error) {
    console.error("Ошибка при извлечении данных из PDF:", error);
    return null;
  }
}

module.exports = { extractDataFromPDF };
