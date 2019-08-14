var express = require('express')
    app = express(),    
    http = require('http').Server(app),
    io = require('socket.io')(http),
    db = require('./queries'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    path = require('path');

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     User.findOne({ username: username }, function(err, user) {
//       if (err) { return done(err); }
//       if (!user) {
//         return done(null, false, { message: 'Incorrect username.' });
//       }
//       if (!user.validPassword(password)) {
//         return done(null, false, { message: 'Incorrect password.' });
//       }
//       return done(null, user);
//     });
//   }
// ));

// app.post('/login',
//   passport.authenticate('local', { successRedirect: '/',
//                                    failureRedirect: '/login',
//                                    failureFlash: true })
// );

app.get('/', (req, res) => {
  res.sendfile('index.html', {root: __dirname + '/client/'});
});
app.use(express.static(path.join(__dirname, 'public')));
// app.use(passport.initialize());
// app.use(passport.session());

const connectedUsers = {};

io.on('connection', socket => {

  socket.on('name', userId => {
    connectedUsers[userId] = socket;
    console.log(userId + ' connected');
    db.getUserNames(userId)
      .then(userList => {
        userList.forEach(user => {
          user.connected = connectedUsers[user.userid] ? true : false;
        });
        connectedUsers[userId].emit('userList', userList);
      });
    socket.broadcast.emit('user connected', userId);
  });

  socket.on('userList loaded', userId => {
    db.getMessages(1, userId)
      .then(messages => {        
        connectedUsers[userId].emit('private message', messages);
      });
    db.getMessages(1, 0)
      .then(messages => {
        connectedUsers[userId].emit('chat message', messages)
      });
  })

  socket.on('chat message', msg => {
    db.createMessage(msg);
    socket.broadcast.emit('chat message', [msg]);
  });

  socket.on('private message', msg => {
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
      }      
    }    
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});