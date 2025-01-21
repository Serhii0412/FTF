const TelegramBot = require("node-telegram-bot-api");
const path = require("path");
const { extractDataFromPDF } = require("./pdfHandler");
const { sendEmail } = require("./email");
const { drivers, pendingOrders } = require("./drivers");
const fs = require("fs");

// Загрузка переменных из .env
require("dotenv").config();

const BOT_TOKEN = process.env.BOT_TOKEN; // Токен Telegram из .env
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || msg.from.first_name;

  if (!drivers[username]) {
    drivers[username] = { id: chatId, orders: [] };
    bot.sendMessage(
      chatId,
      `Добро пожаловать, ${username}! Вы зарегистрированы как водитель.`
    );
  } else {
    bot.sendMessage(chatId, `Добро пожаловать обратно, ${username}!`);
  }
});

bot.onText(/\/заказ (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const managerName = msg.chat.username || msg.from.first_name;
  const driverUsername = match[1].trim();

  if (!drivers[driverUsername]) {
    bot.sendMessage(chatId, `Водитель с именем ${driverUsername} не найден.`);
    return;
  }

  pendingOrders[chatId] = driverUsername;
  bot.sendMessage(
    chatId,
    `Ожидается загрузка файла для водителя ${driverUsername}.`
  );
});

bot.on("document", async (msg) => {
  const chatId = msg.chat.id;

  if (!pendingOrders[chatId]) {
    bot.sendMessage(
      chatId,
      "Пожалуйста, укажите водителя с помощью команды /заказ <имя_водителя> перед загрузкой файла."
    );
    return;
  }

  const driverUsername = pendingOrders[chatId];
  const fileId = msg.document.file_id;
  const originalFilename = msg.document.file_name;

  try {
    const filePath = await bot.downloadFile(fileId, __dirname);

    // Извлекаем данные из PDF
    const extractedData = await extractDataFromPDF(filePath);

    if (
      !extractedData ||
      (!extractedData.lafId &&
        !extractedData.auftragsnummer &&
        !extractedData.kennzeichen)
    ) {
      bot.sendMessage(
        chatId,
        "Не удалось извлечь данные из PDF. Проверьте файл."
      );
      return;
    }

    const lafId = extractedData.lafId || "LAF-ID-не найден";
    const auftragsnummer =
      extractedData.auftragsnummer || "Auftragsnummer-не найдена";
    const kennzeichen = extractedData.kennzeichen || "Kennzeichen-не найден";
    const newFilename = `${
      lafId || auftragsnummer
    }_${kennzeichen}_${driverUsername}.pdf`; // Исправлено: добавлены обратные кавычки

    bot.sendMessage(
      chatId,
      `Файл успешно загружен и назначен водителю ${driverUsername}.\n\n- LAF-ID: ${lafId}\n- Auftragsnummer: ${auftragsnummer}\n- Kennzeichen: ${kennzeichen}`
    );

    bot.sendMessage(
      drivers[driverUsername].id,
      `Вам назначен новый заказ:\n\n- LAF-ID: ${lafId}\n- Auftragsnummer: ${auftragsnummer}\n- Kennzeichen: ${kennzeichen}`
    );

    // Отправляем файл на email
    await sendEmail(
      filePath,
      process.env.MANAGER_EMAIL,
      `Новый заказ: ${newFilename}`,
      "Файл заказа во вложении."
    ); // Исправлено: добавлены обратные кавычки

    // Удаляем временный файл
    fs.unlinkSync(filePath);

    delete pendingOrders[chatId];
  } catch (error) {
    console.error("Ошибка обработки файла:", error);
    bot.sendMessage(
      chatId,
      "Произошла ошибка при обработке файла. Попробуйте снова."
    );
  }
});

module.exports = bot;
