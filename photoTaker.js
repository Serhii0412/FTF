const photosFromDriver = {};

// Функция для обработки фотографий
function handlePhoto(msg, bot) {
    const chatId = msg.chat.id;

    if (!photosFromDriver[chatId]) photosFromDriver[chatId] = [];

    photosFromDriver[chatId].push(msg.photo);

    if (photosFromDriver[chatId].length >= 8) {
        bot.sendMessage(chatId, 'Спасибо! Вы отправили все необходимые фотографии.');
        photosFromDriver[chatId] = []; // Сброс для следующего заказа
    } else {
        bot.sendMessage(chatId, `Вы отправили ${photosFromDriver[chatId].length}/8 фотографий. Отправьте ещё.`);
    }
}

module.exports = {
    handlePhoto,
};