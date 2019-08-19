const express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  db = require('./queries'),
  path = require('path'),
  bodyParser = require('body-parser'),
  loginRouter = require('./routes/login');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.sendFile('login.html', { root: __dirname + '/public/views' });
});

app.post('/', (req, res, next) => {
  console.log(req.body);
  db.authorize(req.body.username, req.body.password).then(data => {
    if (data) {
      res.sendFile('index.html', { root: __dirname + '/public/views' });
    } else {
      res.sendFile('login.html', { root: __dirname + '/public/views' });
    }
  });
});

//app.use('/', loginRouter);

const connectedUsers = {};

io.on('connection', socket => {
  socket.on('name', userId => {
    connectedUsers[userId] = socket;
    console.log(userId + ' connected');
    db.getUserNames(userId).then(userList => {
      userList.forEach(user => {
        user.connected = connectedUsers[user.userid] ? true : false;
      });
      connectedUsers[userId].emit('userList', userList);
    });
    socket.broadcast.emit('user connected', userId);
  });

  socket.on('userList loaded', userId => {
    db.getMessages(1, userId).then(messages => {
      connectedUsers[userId].emit('private message', messages);
    });
    db.getMessages(1, 0).then(messages => {
      connectedUsers[userId].emit('chat message', messages);
    });
  });

  socket.on('chat message', msg => {
    db.createMessage(msg);
    socket.broadcast.emit('chat message', [msg]);
  });

  socket.on('private message', msg => {
    console.log(msg);

    db.createMessage(msg);
    if (connectedUsers[msg.receiver]) {
      connectedUsers[msg.receiver].emit('private message', [msg]);
    }
  });

  socket.on('disconnect', () => {
    for (let userId in connectedUsers) {
      if (connectedUsers[userId] === socket) {
        delete connectedUsers[userId];
        io.emit('user disconnected', userId);
        console.log(userId, ' disconnected');
      }
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
