const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { auth } = require("../middlewares/auth");

// Rotas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", auth, authController.me);
// aqui sao as rotas de api somente, a logica dessas rotas vao ser feitas na pasta controllers.

module.exports = router;