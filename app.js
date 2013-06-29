var http        = require('http'),
    express     = require('express'),
    socket      = require('socket.io'),
    ejs         = require('ejs-locals'),
    stylus      = require('stylus'),
    uglify      = require("./uglify-middleware.js"),
    UserHandler = require("./user-handler.js").UserHandler,
    app         = express(),
    server      = http.createServer(app),
    io          = socket.listen(server);

// Configuration
app.engine('ejs', ejs);
app.set('view engine', 'ejs');
app.use(stylus.middleware({
  src: __dirname + "/assets",
  dest: __dirname + "/static"
}));
app.use(uglify.middleware({
  src:  __dirname + "/assets",
  dest: __dirname + "/static"
}));
app.use(express.static(__dirname + "/static"));

// Routes
app.get("*", function (req, res) {
  res.render("index");
});

// Log level
io.set('log level', 1);

// Socket.IO
var userHandler = new UserHandler();

io.sockets.on("connection", function (socket) {
  socket.on("enter", function (data) {
    data.nickname = data.nickname.trim();

    if (data.nickname && data.nickname.length <= 35) {
      var userId = userHandler.addUser(data.nickname);

      if (userId) {
        socket.set("userId", userId, function () {
          socket.broadcast.emit("info", { message: data.nickname + " has joined." });
          socket.emit("enter response", { accepted: true });
        });   
      } else {
        socket.emit("enter response", { accepted: false, message: "The nickname is already taken." });  
      }
    } else {
      socket.emit("enter response", { accepted: false, message: "The nickname is invalid (max. 35 characters)." });
    }
  });

  socket.on("message", function (data) {
    data.message = data.message.trim();

    if (data.message.length <= 400) {
      socket.get("userId", function (err, userId) {
        if (!err && userId) {
          var user          = userHandler.getUserById(userId),
              messageObject = {
                message: data.message,
                nickname: user.nickname,
                color: user.color,
                external: true
              };

          if (Date.now() - user.lastMessage < 1500) {
            socket.emit("message response", { accepted: false, message: "Slow down! You're posting too fast." });
          } else {
            user.lastMessage = Date.now();

            socket.broadcast.emit("message", messageObject);

            messageObject.external = false;

            socket.emit("message", messageObject);  
          }

          
        }
      });
    } else {
      socket.emit("message response", { accepted: false, message: "The message is too long." })
    }
  });

  socket.on("disconnect", function () {
    socket.get("userId", function (err, userId) {
      if (!err && userId) {
        var user = userHandler.getUserById(userId);
        if (user) {
          userHandler.removeUser(userId);
          socket.broadcast.emit("info", { message: user.nickname + " has left." });
        }
      }      
    });
  });
});

// Start listening
var port = process.env.PORT || 7000,
    host = process.env.HOST || "0.0.0.0";

server.listen(port, host, function() {
  console.log("Listening on: " + host + ":" + port);
});
