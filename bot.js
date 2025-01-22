// Загружаем переменные из файла .env
require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const { startRegistration, sendOrderToDriver } = require('./drivers');
const { handlePdfOrder, sendPhotosToDriver } = require('./pdfHandler');

// Создаем бота с токеном из переменной окружения
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Обработка команды /start (для обычных пользователей)
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Привет! Нажмите на кнопку "Зарегистрироваться", чтобы начать.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Зарегистрироваться', callback_data: 'register' }]
            ]
        }
    });
});

// Обработка кнопки регистрации
bot.on('callback_query', (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;

    if (data === 'register') {
        startRegistration(chatId, bot); // Начало регистрации водителя
    }
    
    // Отправка заказа водителю
    if (data.startsWith('send_order_')) {
        const parts = data.split('_');
        const driverId = parts[1];
        const pdfFilePath = parts[2];
        handlePdfOrder(driverId, pdfFilePath, bot);
    }
});

// Отправка фотографий водителю
bot.on('document', (msg) => {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;
    const fileName = msg.document.file_name;
    
    if (fileName.endsWith('.pdf')) {
        sendPhotosToDriver(chatId, bot);
    }
});

module.exports = bot;