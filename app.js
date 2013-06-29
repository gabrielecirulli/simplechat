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

// Socket.IO
var userHandler = new UserHandler();

io.sockets.on("connection", function (socket) {
  socket.on("enter", function (data) {
    data.nickname = data.nickname.trim();

    if (data.nickname) {
      var userId = userHandler.addUser(data.nickname);

      if (userId) {
        socket.set("userId", userId, function () {
          socket.emit("enter response", { accepted: true });
        });   
      } else {
        socket.emit("enter response", { accepted: false, message: "The nickname you chose is already taken." });  
      }
    } else {
      socket.emit("enter response", { accepted: false, message: "The nickname you chose is invalid." });
    }
  });

  socket.on("message", function (data) {
    data.message = data.message.trim();

    if (data.message) {
      socket.get("userId", function (err, userId) {
        if (!err) {
          var user          = userHandler.getUserById(userId),
            messageObject = {
              message: data.message,
              nickname: user.nickname,
              color: user.color,
              external: true
            };

          socket.broadcast.emit("message", messageObject);

          messageObject.external = false;

          socket.emit("message", messageObject);
        }
      });
    }
  });
});

// Start listening
server.listen(7000);

