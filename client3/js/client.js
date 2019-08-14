const socket = io.connect('http://localhost:3000'); //Подключаемся к нашему соккету
const me = 3;
users = {[me]: 'Mary'};

socket.on('connect', () => { //При успешном соединении с сервером    
    console.info("Connected to server");
    socket.emit('name', me);
});

socket.on('userList', userList => {
    const select = document.getElementById('private-selection');
    userList.forEach(user => {
        users[user.userid] = user.name;
        const option = document.createElement('option');
        option.value = user.userid;
        option.innerHTML = user.name;
        
        select.appendChild(option);
    });
    socket.emit('userList loaded', me);
})

function send() {
    const input = document.getElementById('m'),
    receiver  = +document.getElementById('private-selection').value,
    message = {
        author: me,
        message: input.value,
        receiver,        
    };

    socket.emit('private message', message);
    input.value = '';
    input.focus();
    message.id = new Date().getTime();
    addMessage(message, 'private');
}

function sendToAll() {
    let input = document.getElementById('m');    
    const message = {
        author: me,
        message: input.value,
        receiver: 0,
    }

    socket.emit('chat message', message);
    input.value = '';
    input.focus();
    message.id = new Date().getTime();
    addMessage(message, 'chat');
}

socket.on('private message', msg => { //Когда с сервера приходит сообщение    
    console.info(msg);
    msg.forEach(el => {
        addMessage(el, 'private');
    });
    
});

socket.on('chat message', msg => {
    console.info(msg);
    msg.forEach(el => {
        addMessage(el, 'chat')
    });
});

const addMessage = (msg, target) => {
    const li = document.createElement("li");
    let date;

    if (msg.id) {
        date = new Date(+msg.id).toLocaleString();
    } else {
        date = new Date().toLocaleString();
    }

    li.innerHTML = users[msg.author] + ' [' + date + ']: <br>' + msg.message;
    document.getElementById(target).appendChild(li);
};
