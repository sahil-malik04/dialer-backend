const status = require("./status");

exports.successAction = successAction;
exports.failAction = failAction;

function successAction(data, message = "OK") {
  return { statusCode: status.SUCCESS, data, message };
}

function failAction(message) {
  return { statusCode: status.FAILURE, message };
}
