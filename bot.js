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
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { startRegistration } = require('./drivers.js');
const { handlePdfOrder } = require('./pdfHandler');
const { handlePhoto } = require('./photoTaker');
const fs = require('fs'); // Переместил импорт fs в начало файла


const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Команда /start для начала работы
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! Нажмите на кнопку "Регистрация", чтобы начать.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Регистрация', callback_data: 'register' }]
            ]
        }
    });
});

// Обработка регистрации водителя
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'register') {
        // Регистрация водителя
        await startRegistration(chatId, bot);

        // Отправляем меню водителю
        sendDriverMenu(chatId);
    }

    // Обработка действий из меню водителя
    if (data === 'send_photo') {
        bot.sendMessage(chatId, 'Пожалуйста, отправьте 8 фотографий.');
    } else if (data === 'send_pdf') {
        bot.sendMessage(chatId, 'Отправьте файл PDF.');
    } else if (data === 'contact_manager') {
        bot.sendMessage(chatId, 'Напишите ваше сообщение, и мы передадим его менеджеру.');
        bot.once('message', (msg) => {
            const managerChatId = process.env.MANAGER_CHAT_ID;
            bot.sendMessage(managerChatId, `Сообщение от водителя (ID: ${chatId}):\n${msg.text}`);
            bot.sendMessage(chatId, 'Ваше сообщение отправлено менеджеру.');
        });
    }
});

// Обработка фотографий
bot.on('photo', (msg) => {
    handlePhoto(msg, bot);
});

// Обработка PDF-файлов
bot.on('document', (msg) => {
    handlePdfOrder(msg, bot);
});

// Меню для водителя
function sendDriverMenu(chatId) {
    bot.sendMessage(chatId, 'Выберите действие:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Выслать фото', callback_data: 'send_photo' }],
                [{ text: 'Выслать файл PDF', callback_data: 'send_pdf' }],
                [{ text: 'Написать менеджеру', callback_data: 'contact_manager' }],
                [{ text: 'Вы заправились ?', callback_data: 'send_photo' }],
                [{ text: 'Была мойка авто ?', callback_data: 'send_photo' }],
            ]
        }
    });
}

// Обработка команды для установки менеджера
bot.on('message', (msg) => {
    const chatId = msg.chat.id;

    if (msg.text === '/set_manager') {
        const managerChatId = chatId;

        if (process.env.MANAGER_CHAT_ID) {
            bot.sendMessage(chatId, `Менеджер уже установлен. Его ID: ${process.env.MANAGER_CHAT_ID}`);
            return;
        }

        try {
            fs.appendFileSync('.env', `MANAGER_CHAT_ID=${managerChatId}\n`, 'utf8'); // Исправлено: добавлены обратные кавычки
            bot.sendMessage(chatId, 'Ваш ID сохранён как ID менеджера.');
            // Перезагружаем переменные окружения
            require('dotenv').config(); // Перезагрузка переменных окружения
        } catch (err) {
            console.error('Ошибка записи в .env файл:', err);
            bot.sendMessage(chatId, 'Произошла ошибка при сохранении ID менеджера.');
        }
    }
});

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
});

module.exports = bot;