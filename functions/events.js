const dialDataModel = require("../api/models/dialDataModel");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
require("../api/db/config");
const axios = require("axios");
const moment = require("moment");

exports.handler = async (context, event, callback) => {
  const result = {
    CallStatus: event.CallStatus,
    To: event.To,
  };

  try {
    await dialDataModel.findOneAndUpdate(
      { sid: event.CallSid },
      {
        $set: {
          callStatus: event.CallStatus,
          answeredBy: event.AnsweredBy ? event.AnsweredBy : "",
        },
      }
    );

    if (event.AnsweredBy != undefined) {
      if (event.AnsweredBy === "human") {
        let currentTime = new Date().getTime();

        const dialData = await dialDataModel.find({
          createdAt: {
            $lte: new Date(currentTime - 36000),
            $gte: new Date(currentTime),
          },
        });

        console.log("dialData", dialData);

        //   let createdAt = dialData[i].createdAt;
        // let convertDBDateToObj = new Date(createdAt).getTime();

        // const currentDate = new Date().getTime();

        // let difference = currentDate - convertDBDateToObj;

        // var mm = Math.floor(difference / 1000 / 60);
        // difference -= mm * 1000 * 60;

        //   if (event.AnsweredBy == "human" && mm <= 10) {

        //   } else {
        //   }


        const findbySid = await dialDataModel.find({ sid: event.CallSid });
        await axios.post("http://localhost:3000/api/getEvents", {
          to: findbySid.to,
          callStatus: "in-progress",
          answeredBy: event.AnsweredBy,
        });
        //
      } else if (event.AnsweredBy === "machine_start" || "fax" || "unknown") {
        client
          .calls(event.CallSid)
          .update({ status: "completed" })
          .then(async (result) => {
            await axios.post("http://localhost:3000/api/getEvents", {
              to: result.to,
              callStatus: "cancelled",
              answeredBy: event.AnsweredBy,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    } else {
      await axios.post("http://localhost:3000/api/getEvents", {
        to: event.To,
        callStatus: event.CallStatus,
        answeredBy: null,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
