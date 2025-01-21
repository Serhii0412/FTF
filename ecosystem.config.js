module.exports = {
  apps: [
    {
      name: "telegram-bot", // Имя процесса
      script: "./index.js", // Основной файл для запуска
      watch: true, // Автоматическая перезагрузка при изменении кода
      env: {
        NODE_ENV: "development",
        BOT_TOKEN: "7013587419:AAHLnsJkjgbH3g_Mk0BriNYN6Trqz8dV8RQ",
      },
      env_production: {
        NODE_ENV: "production",
        BOT_TOKEN: "7013587419:AAHLnsJkjgbH3g_Mk0BriNYN6Trqz8dV8RQ",
      },
    },
  ],
};
