// require('dotenv').config();
// const TelegramBot = require('node-telegram-bot-api');
// const { startRegistration } = require('./drivers');
// const { handlePdfOrder } = require('./pdfHandler');
// const { handlePhoto } = require('./photoTaker'); // Подключаем photoTaker.js

// const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// // Обработка команды /start
// bot.onText(/\/start/, (msg) => {
//     const chatId = msg.chat.id;
//     bot.sendMessage(chatId, 'Привет! Нажмите на кнопку "Регистрация", чтобы начать.', {
//         reply_markup: {
//             inline_keyboard: [
//                 [{ text: 'Регистрация', callback_data: 'register' }]
//             ]
//         }
//     });
// });

// // Обработка кнопок
// bot.on('callback_query', (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id;
//     const data = callbackQuery.data;

//     if (data === 'register') {
//         startRegistration(chatId, bot); // Регистрация водителя
//     }
// });

// // Обработка фотографий
// bot.on('photo', (msg) => {
//     handlePhoto(msg, bot); // Используем функцию из photoTaker.js
// });

// // Обработка ошибок
// bot.on('polling_error', (error) => {
//     console.error('Ошибка polling:', error);
// });

// bot.on('message', (msg) => {
//     const chatId = msg.chat.id;

//     // Если это менеджер, сохраняем его ID
//     if (msg.text === '/set_manager') {
//         const managerChatId = chatId;

//         // Логика сохранения ID менеджера
//         console.log(`Manager Chat ID: ${managerChatId}`);
//         bot.sendMessage(chatId, 'Ваш ID сохранён как ID менеджера.');

//         // Записываем ID в .env файл
//         const fs = require('fs');
//         const dotenv = require('dotenv'); // Подключаем dotenv для работы с переменными окружения

//         // Считываем текущие переменные из .env
//         dotenv.config();

//         // Записываем новый ID менеджера в .env
//         fs.appendFileSync('.env', `MANAGER_CHAT_ID=${managerChatId}\n`, 'utf8');
//     }
// });

// bot.on('callback_query', async (callbackQuery) => {
//     const chatId = callbackQuery.message.chat.id;
//     const data = callbackQuery.data;

//     if (data === 'register') {
//         await startRegistration(chatId, bot);
//         sendDriverMenu(chatId, bot); // Отправляем меню водителю после регистрации
//     }

//     // Обработка действий из меню водителя
//     if (data === 'send_photo') {
//         bot.sendMessage(chatId, 'Пожалуйста, отправьте 8 фотографий.');
//     } else if (data === 'send_pdf') {
//         bot.sendMessage(chatId, 'Отправьте файл PDF.');
//     } else if (data === 'contact_manager') {
//         bot.sendMessage(chatId, 'Напишите ваше сообщение, и мы передадим его менеджеру.');
//         bot.once('message', (msg) => {
//             const managerChatId = process.env.MANAGER_CHAT_ID;
//             bot.sendMessage(managerChatId, `Сообщение от водителя (ID: ${chatId}):\n${msg.text}`);
//             bot.sendMessage(chatId, 'Ваше сообщение отправлено менеджеру.');
//         });
//     }
// });

// // Функция для отправки меню водителя
// function sendDriverMenu(chatId, bot) {
//     bot.sendMessage(chatId, 'Выберите действие:', {
//         reply_markup: {
//             inline_keyboard: [
//                 [{ text: 'Выслать фото', callback_data: 'send_photo' }],
//                 [{ text: 'Выслать файл PDF', callback_data: 'send_pdf' }],
//                 [{ text: 'Написать менеджеру', callback_data: 'contact_manager' }]
//             ]
//         }
//     });
// }

// module.exports = bot;

// NEWNEW CODE//
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { sendDriverMenu } = require("./drivers.js"); // Подключаем функции водителя
const {
  notifyManager,
  sendManagerMenu,
  handleManagerActions,
} = require("./manager.js"); // Подключаем функции менеджера

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ID менеджера (задайте вручную или через .env)
const managerChatId = process.env.MANAGER_CHAT_ID;

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  if (chatId.toString() === managerChatId) {
    // Если это менеджер
    notifyManager(bot, chatId);
    sendManagerMenu(chatId, bot);
  } else {
    // Если это водитель
    sendDriverMenu(chatId, bot);
  }
});

// Обработка callback-запросов от водителя
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;

  if (chatId.toString() === managerChatId) {
    // Обработка действий менеджера
    handleManagerActions(callbackQuery, bot);
  } else {
    // Обработка действий водителя
    const data = callbackQuery.data;
    switch (data) {
      case "send_photo":
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
  }
});

module.exports = bot;
