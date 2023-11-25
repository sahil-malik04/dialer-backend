const express = require("express");
const router = express.Router();

// const  dialNumber  = require("../controllers/dialerController");
const eventController = require("../controllers/eventController");
router.post("/", eventController.getEvents);

module.exports = router;