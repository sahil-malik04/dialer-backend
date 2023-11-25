const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const dialDataModel = require("../models/dialDataModel");

// const VoiceResponse = require("twilio").twiml.VoiceResponse;

// const response = new VoiceResponse();
// response.say(
//   {
//     voice: "alice",
//     language: "pt-BR",
//     loop: 2,
//   },
//   "Bom dia."
// );



// console.log(response.toString());

// Function to Dial Numbers
async function dialNumbers(payload) {
  console.log("Payload =>", payload);

  return new Promise(async function (resolve, reject) {

    // make an ougoing call

    try {
      
      const numbers = payload.numbers;
      const amd = payload.amd;
      const from = process.env.TWILIO_NUMBER

      numbers.map((item) => {
        client.calls.create(
          {
            machineDetection: amd == true ? "Enable" : "none",
            asyncAmd: amd == true ? true : false,
            asyncAmdStatusCallback:
              amd == true ? "https://c0e0-122-161-192-114.ngrok.io/events" : "",
            statusCallback: "https://c0e0-122-161-192-114.ngrok.io/events",
            statusCallbackMethod: "GET",
            statusCallbackEvent: [
              "initiated",
              "ringing",
              "answered",
              "completed",
            ],
            url: "http://demo.twilio.com/docs/voice.xml",
            to: item,
            from: from
          },
          async (err, call) => {
            if (err) {
              console.log(err);
              return err;
            }
            const date = new Date();
            // let convertDate = date.toUTCString();

            // const IsNumberExist = await dialDataModel.find({ to: call.to });

            // if (IsNumberExist.length > 0) {
            //   console.log({ success: false, msg: "number already exist" });
            // }
            const fields = new dialDataModel({
              sid: call.sid,
              from: call.from,
              to: call.to,
              callStatus: "",
              answeredBy: "",
              createdAt: date,
              updatedAt: date,
            });
            const save = await fields.save();
            if (save) {
              console.log({ success: true, msg: "inserted successfully" });
            } else {
              console.log({
                success: false,
                msg: "there's an issue storing the data",
              });
            }
          }
        );
      });

      return resolve(payload);
    } catch (error) {
      return reject(error);
    }
  });
}

module.exports = {
  dialNumbers,
};
