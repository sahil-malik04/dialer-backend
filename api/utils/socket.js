let io;
module.exports = {
  init: (server) => {
    io = require('socket.io')(server,{
        cors: {
            origin: "http://localhost:4200",
            methods: ["GET", "POST"],
            credentials: true,
            allowEIO3: true
          }
      });
    return io;
  },
  get: () => {
    if (!io) {
      throw new Error("socket is not initialized");
    }
    return io;
  }
};
