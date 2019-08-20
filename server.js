const express = require('express'),
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  db = require('./queries'),
  path = require('path');

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

const connectedUsers = {},
  users = db.getUserNames();

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
    let userMessages = [];
    for (let key in users) {
      if (key === userId) {
        continue;
      }
      if (object.hasOwnProperty(key)) {
        const user = users[key];
        db.getMessagesByUser(userId, user.id).then(messages => {
          userMessages = [...userMessages, ...messages];
        });
      }
    }
    connectedUsers[userId].emit('private message', userMessages);
    // let unseenMessages = [];
    db.getUnseenMessages(userId).then(messages => {
      console.log(messages);      
      connectedUsers[userId].emit('unseen messages', messages);
    });
    
    db.getMessagesByUser(userId, '_chat').then(messages => {
      connectedUsers[userId].emit('chat message', messages);
    });
  });

  socket.on('user online', userId => {
    setTimeout(() => db.setLastSeen(userId), 10000);
  })

  socket.on('chat message', msg => {
    console.log(msg);
    msg.id = new Date().getTime();
    db.createMessage(msg);
    socket.broadcast.emit('chat message', [msg]);
  });

  socket.on('private message', msg => {
    console.log(msg);
    msg.id = new Date().getTime();
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
