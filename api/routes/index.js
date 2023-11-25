const express = require("express");
const router = express.Router();

// ROUTE
const dialer = require("./dialerRoute");

// AUTH API ROUTES
router.use("/dialer", dialer);

const event = require('./eventRoute');
router.use("/getEvents", event)

// router.use("/check", );

module.exports = router;
