const { failAction, successAction } = require("../utils/response");
const { dialNumbers } = require("../services/dialerService");

// Function to dial number
const dialNumber = async (req, res) => {
  const payload = req.body;
  // console.log(payload)
  try {
    const result = await dialNumbers(payload);
    res.status(200).json(successAction(result, "Dial Number Successfully!"));
  } catch (error) {
    console.log("catch error =>", error);
    res.status(400).json(failAction(error));
  }
};


module.exports =  dialNumber