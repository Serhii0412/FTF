const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const path = require("path");

// Папка для хранения заказов (PDF файлов)
const ordersDirectory = path.join(__dirname, "orders");

// Функция для обработки PDF (например, добавление имени водителя в файл)
async function handlePdfOrder(driverId, pdfFilePath, bot) {
  const existingPdfBytes = fs.readFileSync(pdfFilePath);
  const pdfDoc = await PDFDocument.load(existingPdfBytes);

  // Здесь ты можешь обработать PDF, например, добавить имя водителя
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  firstPage.drawText(`Имя водителя: ${driverId}`, { x: 50, y: 700, size: 12 });

  const pdfBytes = await pdfDoc.save();
  const filledPdfPath = pdfFilePath.replace(".pdf", "_filled.pdf");
  fs.writeFileSync(filledPdfPath, pdfBytes);

  await bot.sendDocument(driverId, filledPdfPath, {
    caption: "Ваш заказ с заполненными данными",
  });
}

// Функция для отправки фотографий водителю
function sendPhotosToDriver(driverId, bot) {
  const photos = getPhotos();

  // Убедимся, что у нас есть хотя бы 8 фотографий
  if (photos.length < 8) {
    bot.sendMessage(
      driverId,
      "Для отправки заказов необходимо минимум 8 фотографий."
    );
    return;
  }

  // Отправляем фотографии
  photos.slice(0, 8).forEach((photo, index) => {
    bot.sendPhoto(driverId, photo, { caption: `Фото ${index + 1}` }); // Исправлено: добавлены обратные кавычки
  });
}

// Функция для получения списка фотографий
function getPhotos() {
  const photosDirectory = path.join(__dirname, "photos");
  return fs
    .readdirSync(photosDirectory)
    .map((fileName) => path.join(photosDirectory, fileName));
}

module.exports = { handlePdfOrder, sendPhotosToDriver };
