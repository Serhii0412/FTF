const fs = require("fs");
const path = require("path");
const { bot } = require("./bot"); // Подключаем вашего бота
const { sendMessageWithButtons } = require("./utils"); // Используем вспомогательную функцию для отправки кнопок

// Путь к базе данных водителей
const driversFile = path.join(__dirname, "drivers.json");

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
  const drivers = getDrivers();
  const isRegistered = drivers.some((driver) => driver.chatId === chatId);

  if (isRegistered) {
    bot.sendMessage(chatId, "Вы уже зарегистрированы.");
    return;
  }

  // Добавление водителя в базу данных
  const newDriver = { chatId, name: `Водитель #${chatId}` }; // Добавлено имя водителя
  saveDriver(newDriver);

  bot.sendMessage(chatId, "Вы успешно зарегистрированы! Теперь ждите заказ.");
  sendDriverMenu(chatId, bot); // Отправляем меню водителю после регистрации
}

// Функция для отправки меню водителя
function sendDriverMenu(chatId, bot) {
  bot.sendMessage(chatId, "Выберите действие:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Выслать фото", callback_data: "send_photo" }],
        [{ text: "Выслать файл PDF", callback_data: "send_pdf" }],
        [{ text: "Написать менеджеру", callback_data: "contact_manager" }],
        [{ text: "Вы заправлялись", callback_data: "fuel" }],
        [{ text: "Мойка авто", callback_data: "wash" }],
      ],
    },
  });
}

// Обработка фото
const sentMessages = {}; // Храним ID сообщений, чтобы обновить их, если фото повторяется
bot.on("photo", (msg) => {
  const chatId = msg.chat.id;

  // Если фото уже было отправлено, удаляем старое
  if (sentMessages[chatId]) {
    bot
      .deleteMessage(chatId, sentMessages[chatId])
      .catch((err) => console.log("Ошибка удаления старого фото:", err));
  }

  // Отправляем сообщение, что фото получено
  bot
    .sendMessage(chatId, "Фото получено!", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Выслать фото", callback_data: "send_photo" }],
          [{ text: "Выслать файл PDF", callback_data: "send_pdf" }],
          [{ text: "Написать менеджеру", callback_data: "contact_manager" }],
          [{ text: "Вы заправлялись", callback_data: "fuel" }],
          [{ text: "Мойка авто", callback_data: "wash" }],
        ],
      },
    })
    .then((sentMessage) => {
      // Сохраняем ID этого сообщения
      sentMessages[chatId] = sentMessage.message_id;
    });
});

// Обработка PDF файлов
bot.on("document", (msg) => {
  const chatId = msg.chat.id;

  // Если файл был уже отправлен, удаляем старое сообщение
  if (sentMessages[chatId]) {
    bot
      .deleteMessage(chatId, sentMessages[chatId])
      .catch((err) => console.log("Ошибка удаления старого файла:", err));
  }

  // Отправляем сообщение о файле
  bot
    .sendMessage(chatId, "Файл получен!", {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Выслать фото", callback_data: "send_photo" }],
          [{ text: "Выслать файл PDF", callback_data: "send_pdf" }],
          [{ text: "Написать менеджеру", callback_data: "contact_manager" }],
          [{ text: "Вы заправлялись", callback_data: "fuel" }],
          [{ text: "Мойка авто", callback_data: "wash" }],
        ],
      },
    })
    .then((sentMessage) => {
      // Сохраняем ID этого сообщения
      sentMessages[chatId] = sentMessage.message_id;
    });
});

// Обработка нажатий на кнопки меню
bot.on("callback_query", (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === "fuel") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте фото заправки.");
    bot.once("photo", (msg) => {
      bot.sendMessage(chatId, "Фото заправки получено!");
      sendDriverMenu(chatId, bot); // Обновляем меню водителя
    });
  }

  if (data === "wash") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте фото мойки авто.");
    bot.once("photo", (msg) => {
      bot.sendMessage(chatId, "Фото мойки получено!");
      sendDriverMenu(chatId, bot); // Обновляем меню водителя
    });
  }

  if (data === "send_photo") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте фото.");
  }

  if (data === "send_pdf") {
    bot.sendMessage(chatId, "Пожалуйста, отправьте PDF файл.");
  }

  if (data === "contact_manager") {
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
  }
});

module.exports = { startRegistration, saveDriver, getDrivers, sendDriverMenu };
