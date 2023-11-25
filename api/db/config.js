const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connect = mongoose.connect("mongodb://localhost:27017/dialer_db");


if(connect){
    console.log("db connected successfully");
}
else{
    console.log("db connection error");
}