const sendOrderToDriver = (driverId, pdfFilePath, bot) => {
  bot.sendMessage(
    driverId,
    "У вас новый заказ! Пожалуйста, заполните форму и отправьте нам обратно.",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Отправить файл",
              callback_data: `send_file_${driverId}_${pdfFilePath}`,
            },
          ],
        ],
      },
    }
  );
};

const notifyManager = (bot, managerChatId) => {
  bot.sendMessage(managerChatId, "Вы зарегистрированы как менеджер.");
};

// Меню для менеджера
const sendManagerMenu = (chatId, bot) => {
  bot.sendMessage(chatId, "Меню менеджера:", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Отправить заказ водителю", callback_data: "send_order" }],
        [{ text: "Написать водителю", callback_data: "write_driver" }],
      ],
    },
  });
};

// Обработчик действий менеджера
const handleManagerActions = (callbackQuery, bot) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  if (data === "send_order") {
    bot.sendMessage(chatId, "Введите ID водителя и отправьте PDF файл.");
    bot.once("document", (msg) => {
      const driverId = msg.caption; // ID водителя в подписи к файлу
      const fileId = msg.document.file_id;

      bot.sendDocument(driverId, fileId, {
        caption: "Вам отправлен заказ. Ознакомьтесь и заполните.",
      });
      bot.sendMessage(
        chatId,
        `Заказ успешно отправлен водителю (ID: ${driverId}).`
      );
    });
  } else if (data === "write_driver") {
    bot.sendMessage(chatId, "Введите ID водителя и сообщение.");
    bot.once("message", (msg) => {
      const [driverId, ...message] = msg.text.split(" ");
      bot.sendMessage(driverId, `Сообщение от менеджера: ${message.join(" ")}`);
      bot.sendMessage(
        chatId,
        `Сообщение отправлено водителю (ID: ${driverId}).`
      );
    });
  }
};

module.exports = {
  sendOrderToDriver,
  notifyManager,
  sendManagerMenu,
  handleManagerActions,
};
