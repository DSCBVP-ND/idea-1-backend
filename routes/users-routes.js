const express = require("express");
const router = express.Router();

const userControllers = require("../controllers/users-controllers");

router.get("/allUsers", userControllers.getAllUsers);

router.post("/createUser", userControllers.createUser);

module.exports = router;
