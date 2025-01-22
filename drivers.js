require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ID менеджера, задайте вручную или через .env
const managerChatId = process.env.MANAGER_CHAT_ID;

// Функция: отправить меню водителю
function sendDriverMenu(chatId, bot) {
  bot.sendMessage(chatId, "Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Выслать фото", callback_data: "send_photo" }],
        [{ text: "Выслать файл PDF", callback_data: "send_pdf" }],
        [{ text: "Написать менеджеру", callback_data: "contact_manager" }],
        [{ text: "Вы заправлялись", callback_data: "refuel" }],
        [{ text: "Мойка авто", callback_data: "car_wash" }],
      ],
    },
  });
}

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  // Если это менеджер, покажем сообщение, что он зарегистрирован
  if (chatId.toString() === managerChatId) {
    bot.sendMessage(chatId, "Вы зарегистрированы как менеджер.");
  } else {
    // Показываем меню водителя
    sendDriverMenu(chatId, bot);
  }
});

// Обработка callback-запросов от водителя
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  switch (data) {
    case "send_photo":
      // Водитель отправляет фото
      bot.sendMessage(chatId, "Пожалуйста, отправьте фото.");
      bot.once("photo", (msg) => {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        bot.sendPhoto(managerChatId, fileId, {
          caption: `Водитель (ID: ${chatId}) отправил фото.`,
        });
        bot.sendMessage(chatId, "Фото отправлено менеджеру.");
      });
      break;

    case "send_pdf":
      // Водитель отправляет PDF
      bot.sendMessage(chatId, "Пожалуйста, отправьте файл PDF.");
      bot.once("document", (msg) => {
        if (msg.document.mime_type === "application/pdf") {
          const fileId = msg.document.file_id;
          bot.sendDocument(managerChatId, fileId, {
            caption: `PDF файл от водителя (ID: ${chatId}).`,
          });
          bot.sendMessage(chatId, "PDF отправлен менеджеру.");
        } else {
          bot.sendMessage(chatId, "Отправьте корректный PDF файл.");
        }
      });
      break;

    case "contact_manager":
      // Водитель пишет менеджеру
      bot.sendMessage(chatId, "Напишите сообщение для менеджера.");
      bot.once("message", (msg) => {
        if (msg.text) {
          bot.sendMessage(
            managerChatId,
            `Сообщение от водителя (ID: ${chatId}): ${msg.text}`
          );
          bot.sendMessage(chatId, "Ваше сообщение отправлено менеджеру.");
        }
      });
      break;

    case "refuel":
      // Водитель отправляет фото заправки авто
      bot.sendMessage(chatId, "Пожалуйста, отправьте фото заправки авто.");
      bot.once("photo", (msg) => {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        bot.sendPhoto(managerChatId, fileId, {
          caption: `Водитель (ID: ${chatId}) отправил фото заправки.`,
        });
        bot.sendMessage(chatId, "Фото отправлено менеджеру.");
      });
      break;

    case "car_wash":
      // Водитель отправляет фото после мойки авто
      bot.sendMessage(chatId, "Пожалуйста, отправьте фото после мойки авто.");
      bot.once("photo", (msg) => {
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        bot.sendPhoto(managerChatId, fileId, {
          caption: `Водитель (ID: ${chatId}) отправил фото после мойки.`,
        });
        bot.sendMessage(chatId, "Фото отправлено менеджеру.");
      });
      break;

    default:
      bot.sendMessage(chatId, "Неизвестная команда. Попробуйте еще раз.");
  }
});
