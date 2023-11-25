const mongoose = require("mongoose");
mongoose.set("strictQuery", false);
const DBURL = process.env.LOCAL_DB_URL;

const connect = mongoose.connect(DBURL);

if (connect) {
  console.log("db connected successfully");
} else {
  console.log("db connection error");
}
