const express = require('express')
  app = express(),
  http = require('http').Server(app),
  io = require('socket.io')(http),
  db = require('./queries'),
  path = require('path'),
  session = require('express-session'),
  passport = require('passport'),
  PostgreSqlStore = require('connect-pg-simple')(session),
  LocalStrategy = require('passport-local').Strategy,
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),

  loginRouter = require('./routes/login');

passport.use(new LocalStrategy(
  function(username, password, done) {
    return true
    // User.findOne({ username : username}, function(err,user) {
    //   return err 
    //     ? done(err)
    //     : user
    //       ? password === user.password
    //         ? done(null, user)
    //         : done(null, false, { message: 'Incorrect password.' })
    //       : done(null, false, { message: 'Incorrect username.' });
    // });
  }
));

// app.use(bodyParser.urlencoded({extended: true}));
// app.use(bodyParser.json());
// app.use(cookieParser());

// app.use(session({
//   store: new PostgreSqlStore({    
//     conString: "postgres://postgres:postgres@localhost:5432/notifications"
//   }),
//   secret: 'very secret phrase',
//   resave: true,
//   saveUninitialized: false,
//   cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 },
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user, done) {
//   console.log(user, done);
  
//   done(null, user.id);
// });

// passport.deserializeUser(function(id, done) {
//   console.log(id, done);
  
//   // User.findById(id, function(err, user){
//   //   err 
//   //     ? done(err)
//   //     : done(null, user);
//   // });
// });

// const authenticate = passport.authenticate('local', {session: true});
    
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.sendFile('login.html', { root: __dirname + '/public/views' });
});

app.post('/',  (req, res, next) => {
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