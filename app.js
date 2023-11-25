require("dotenv").config({ path: "./.env" });

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = process.env.SERVER_PORT || 8080;
const routes = require("./api/routes");
const cors = require("cors");
const { failAction } = require("./api/utils/response");

require("./api/db/config");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((err, req, res, next) => {
  if (err && err.error && err.error.isJoi) {
    // we had a joi error, let's return a custom 400 json response
    res
      .status(400)
      .json(failAction(err.error.message.toString().replace(/[\""]+/g, "")));
  } else {
    response.header("Access-Control-Allow-Credentials", "true");
    response.header("Access-Control-Allow-Origin", request.get("origin"));
    // pass on to another error handler
    next(err);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const whitelist = ["http://localhost:4200"];
const corsOptions = {
  credentials: true, // This is important.
  origin: (origin, callback) => {
    console.log("origin =>", origin);
    if (whitelist.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
};

app.use(cors());
app.use("/api", routes);

const VoiceResponse = require('twilio').twiml.VoiceResponse;
const twilio = require('twilio');
const ClientCapability = twilio.jwt.ClientCapability;


app.get('/api/token', (request, response) => {
  const capability = new ClientCapability({
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
  });

  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: process.env.TWILIO_TWIML_APP_SID})
  );

  const token = capability.toJwt();

  // Include token in a JSON response
  response.send({
    token: token,
  });
});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = require("twilio")(accountSid, authToken);

app.post('/api/voice', (request, response) => {
  // console.log(request.body.numbers)

  let voiceResponse = new VoiceResponse();
  voiceResponse.dial({
    callerId: process.env.TWILIO_NUMBER,
  }, request.body.numbers );
  response.type('json');
  response.send(voiceResponse.toString());

//   client.calls
//   .create({
//     url: "http://demo.twilio.com/docs/voice.xml",
//     from: process.env.TWILIO_NUMBER,
//     to: "+919588316210",
//   })
//   .then((call) => console.log(call.sid))

//   response.send({success: true});
// });

});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
const ngrok = require('ngrok');
const server = app.listen(port, (err) => {
  
 if(err){
      console.log(err)
    }
  
  console.log(`App listening at Port: ${port}`);

  ngrok.connect(port, function (err, url) {
    console.log('hi')
   
    console.log(`Node.js local server is publicly-accessible at ${url}`);
});
});

const io = require("./api/utils/socket").init(server);
global.io = io;
// app.set('io', io);

io.on("connection", (socket) => {
  console.log("Connection success", socket.id);

  socket.on("disconnect", () => {
    console.log("Connection disconnected", socket.id);
  });
});
io.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});


module.exports = app;
