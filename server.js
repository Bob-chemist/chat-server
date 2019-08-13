var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var db = require('./queries');

app.get('/', (req, res) => {
  res.sendfile('index.html');
});

const connectedUsers = {};

io.on('connection', socket => {

  socket.on('name', name => {
    connectedUsers[name] = socket;
    console.log(name + ' connected');
    
    db.getMessages(1)
      .then(messages => {
        connectedUsers[name].emit('private message', messages.length ? messages : {status: 404, date: new Date()});
      })
  });  

  socket.on('chat message', (from, msg) => {
    console.log(from);
    
    io.emit('chat message', msg);
  });

  socket.on('private message', msg => {
    connectedUsers[msg.receiver].emit('private message', msg);        
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});