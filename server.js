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

const connectedUsers = {};
  
  


io.on('connection', socket => {
  socket.on('name', userId => {
    connectedUsers[userId] = socket;
    console.log(userId + ' connected');
    db.getUserNames().then(userList => {
      console.log(userList);
      
      userList.forEach(user => {
        user.connected = connectedUsers[user.userid] ? true : false;
      });
      connectedUsers[userId].emit('userList', userList);
    });
    socket.broadcast.emit('user connected', userId);
  });

  socket.on('userList loaded', userId => {
    
    db.getUserNames().then(users => {
      for (let i = 0; i < users.length; i++) {        
        const user = users[i];
        if (user.userid === userId) {
          continue;
        }
        db.getMessagesByUser(userId, user.userid).then(messages => {
          console.log('user ', user.userid, messages);
          if (messages.length) {
            connectedUsers[userId].emit('old messages', messages);
          }
        });
      }  
    }).catch(err => console.log(err));

    db.getUnseenMessages(userId).then(messages => {
      console.log('unseen', messages);
      if (messages.length) {
        connectedUsers[userId].emit('unseen messages', messages);
      }
    });
    
    db.getChatMessages(userId).then(messages => {
      console.log('chat', messages);
      if (messages.length) {
        connectedUsers[userId].emit('old messages', messages);
      }
      
    });
  });

  socket.on('user online', userId => {
    db.setLastSeen(userId);
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

  socket.on('get old', msg => {
    const {userId, companionId, latest} = msg;
    if (companionId !== '_chat') {
      db.getOldMessages(userId, companionId, latest).then(messages => {
        if (messages.length) {
          connectedUsers[userId].emit('old messages', messages);
        }
      });
    } else {
      db.getOldChatMessages(latest).then(messages => {
        if (messages.length) {
          connectedUsers[userId].emit('old messages', messages);
        }    
      })
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
