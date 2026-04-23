// app.js — простий Express застосунок
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json({ message: "Hello from Node.js app!", status: "ok" });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Експортуємо app для тестів (не запускаємо сервер при імпорті)
module.exports = app;

// Запускаємо сервер тільки якщо файл запущено напряму
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
