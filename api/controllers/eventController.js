const getEvents = async (req, res) => {
  try {
    if (req) {
      io.emit("welcome", req.body);
    }
  } catch (error) {
    res.status(400).send({ success: false, data: error.message });
  }
};

module.exports = { getEvents };
