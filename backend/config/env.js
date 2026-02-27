require("dotenv").config();

const required = ["JWT_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`ERRO: ${key} não definido no .env`);
    process.exit(1);
  }
});

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  PORT: process.env.PORT || 3000
};