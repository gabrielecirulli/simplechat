var http        = require('http'),
    express     = require('express'),
    socket      = require('socket.io'),
    ejs         = require('ejs-locals'),
    stylus      = require('stylus'),
    uglify      = require("./uglify-middleware.js"),
    UserHandler = require("./user-handler.js")
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
    if(data.nickname && !users[data.nickname]) {

    }
  });
});

// Start listening
server.listen(7000);

