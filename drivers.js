const fs = require('fs');
const path = require('path');

// Путь к базе данных водителей
const driversFile = path.join(__dirname, 'drivers.json');

// Функция для чтения базы данных водителей
function getDrivers() {
    try {
        const data = fs.readFileSync(driversFile);
        return JSON.parse(data);
    } catch (err) {
        console.error("Ошибка при чтении файла водителей:", err);
        return [];
    }
}

// Функция для добавления водителя в базу данных
function saveDriver(driver) {
    const drivers = getDrivers();
    drivers.push(driver);
    fs.writeFileSync(driversFile, JSON.stringify(drivers, null, 2));
}

// Обработчик регистрации водителя
function startRegistration(chatId, bot) {
    // Проверка, зарегистрирован ли уже водитель
    const drivers = getDrivers();
    const isRegistered = drivers.some(driver => driver.chatId === chatId);

    if (isRegistered) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы.');
        return;
    }

    // Добавление водителя в базу данных
    const newDriver = { chatId, name: `Водитель #${chatId}` }; // Исправлено: добавлены обратные кавычки
    saveDriver(newDriver);

    bot.sendMessage(chatId, 'Вы успешно зарегистрированы! Теперь ждите заказ.');
}

// Отправка заказа водителю
function sendOrderToDriver(driverId, pdfFilePath, bot) {
    bot.sendMessage(driverId, 'У вас новый заказ! Пожалуйста, заполните форму и отправьте нам обратно.', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Отправить файл', callback_data: `send_file_${driverId}_${pdfFilePath}` }] // Исправлено: добавлены обратные кавычки
            ]
        }
    });
}


const { saveDriverToDatabase, checkDriverInDatabase } = require('./database');

async function startRegistration(chatId, bot) {
    const managerChatId = process.env.MANAGER_CHAT_ID;

    // Проверяем, существует ли водитель в базе данных
    const driverExists = await checkDriverInDatabase(chatId);

    if (driverExists) {
        bot.sendMessage(chatId, 'Вы уже зарегистрированы и ожидаете заказ.');
        return;
    }

    // Сохраняем нового водителя в базе
    const driver = {
        chatId: chatId,
        name: 'Имя водителя', // Можно запросить имя пользователя
        registeredAt: new Date(),
    };

    await saveDriverToDatabase(driver);

    // Уведомляем водителя
    bot.sendMessage(chatId, 'Вы успешно зарегистрированы! Ожидайте заказ от менеджера.');

    // Уведомляем менеджера
    bot.sendMessage(managerChatId, `Новый водитель зарегистрировался!\nИмя: ${driver.name}\nID чата: ${chatId}`);
}


module.exports = { startRegistration, sendOrderToDriver };