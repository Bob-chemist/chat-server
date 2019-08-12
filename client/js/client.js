const socket = io.connect('http://localhost:3000'); //Подключаемся к нашему соккету

socket.on('connect', function(){ //При успешном соединении с сервером    
    console.info("Connected to server");    
});

function send() {
    let msg = document.getElementById('m');
    const message = {
        author: 'me',
        msg: msg.value,
        receiver: 'smbd',
    }

    socket.emit('message', message);
    msg.value = '';
    msg.focus();
}

function sendToAll() {
    let msg = document.getElementById('m');

    socket.emit('chat message', msg.value);
    msg.value = '';
    msg.focus();
}

socket.on('message', function(msg){ //Когда с сервера приходит сообщение    
    console.info(msg);    
    var li=document.createElement("li");
    li.innerHTML = msg.author + ': <br>' + msg.msg;
    document.getElementById("private").appendChild(li);
});

socket.on('chat message', function(msg){
    const li=document.createElement("li");
    li.appendChild(document.createTextNode(msg));
    document.getElementById("chat").appendChild(li);
    });

