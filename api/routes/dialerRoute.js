const express = require("express");
const router = express.Router();
const  dialNumber  = require("../controllers/dialerController");

router.post("/", dialNumber);

module.exports = router;
