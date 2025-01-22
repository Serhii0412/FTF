require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startRegistration, sendDriverMenu } = require("./drivers.js"); // Подключаем функции из drivers.js
const { handlePhoto } = require("./photoTaker"); // Подключаем обработку фото из photoTaker.js
const { handlePdf } = require("./pdfHandler"); // Подключаем обработку PDF из pdfHandler.js

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обработка команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Привет! Нажмите на кнопку "Регистрация", чтобы начать.',
    {
      reply_markup: {
        inline_keyboard: [[{ text: "Регистрация", callback_data: "register" }]],
      },
    }
  );
});

// Обработка кнопок
bot.on("callback_query", async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  // Обработка регистрации водителя
  if (data === "register") {
    await startRegistration(chatId, bot); // Регистрация водителя
    sendDriverMenu(chatId, bot); // Отправляем меню водителю после регистрации
  }

  // Обработка действий из меню водителя
  if (data === "send_photo") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте фото.");
  } else if (data === "send_pdf") {
    bot.sendMessage(chatId, "Отправьте файл PDF.");
  } else if (data === "contact_manager") {
    bot.sendMessage(
      chatId,
      "Напишите ваше сообщение, и мы передадим его менеджеру."
    );
    bot.once("message", (msg) => {
      const managerChatId = process.env.MANAGER_CHAT_ID;
      bot.sendMessage(
        managerChatId,
        `Сообщение от водителя (ID: ${chatId}):\n${msg.text}`
      );
      bot.sendMessage(chatId, "Ваше сообщение отправлено менеджеру.");
    });
  } else if (data === "fueling") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте фото заправки.");
  } else if (data === "car_wash") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте фото мойки авто.");
  }
});

// Обработка фотографий
bot.on("photo", (msg) => {
  handlePhoto(msg, bot); // Используем функцию из photoTaker.js
});

// Обработка PDF файлов
bot.on("document", (msg) => {
  if (msg.document.mime_type === "application/pdf") {
    handlePdf(msg, bot); // Используем функцию из pdfHandler.js
  }
});

// Обработка ошибок
bot.on("polling_error", (error) => {
  console.error("Ошибка polling:", error);
});

module.exports = bot;
