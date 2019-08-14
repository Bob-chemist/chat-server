const socket = io.connect('http://localhost:3000'); //Подключаемся к нашему соккету
const me = 2;
users = {[me]: 'John'};
const messageInput = document.getElementById('m');

messageInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        send();
    }
});

socket.on('connect', () => { //При успешном соединении с сервером    
    console.info("Connected to server");
    socket.emit('name', me);
});

socket.on('userList', userList => {
    const ul = document.getElementById('users-list'),
        chat = document.getElementById('chat-window');

    userList.forEach(user => {
        users[user.userid] = user.name;
        
        const li = document.createElement('li');
        li.className = user.connected ? "online" : '';
        li.innerHTML = user.name;
        li.id = 'userNameId' + user.userid;
        li.onclick = (event) => chooseChat(event);
        ul.appendChild(li);

        const chatWindow = document.createElement('div');
        chatWindow.id = 'chatId' + user.userid;
        chatWindow.style.display = 'none';
        chatWindow.innerHTML = '' +            
            '<h2>' + user.name + '</h2>' +
            '<ul id="userChatId' + user.userid +'"></ul>';
            
        chat.appendChild(chatWindow);
    });
    socket.emit('userList loaded', me);
})

function send() {
    const input = document.getElementById('m'),
    receiver  = +document.querySelector('.selected').id.match(/[0-9]/g),
    message = {
        author: me,
        message: input.value,
        receiver,        
    };
    receiver !== 0 
        ? socket.emit('private message', message)
        : socket.emit('chat message', message);
    input.value = '';
    input.focus();
    message.id = new Date().getTime();
    addMessage(message);
}

socket.on('private message', msg => { //Когда с сервера приходит сообщение    
    console.info(msg);
    msg.forEach(el => addMessage(el));    
});

socket.on('chat message', msg => {
    console.info(msg);
    msg.forEach(el => addMessage(el));
});

socket.on('user connected', userId => {
    document.getElementById('userNameId' + userId).classList.add('online');
    console.log(users[userId] + ' connected');    
});

socket.on('user disconnected', userId => {
    document.getElementById('userNameId' + userId).classList.remove('online');
    console.log(users[userId] + ' disconnected');
});

const addMessage = (msg) => {
    const li = document.createElement("li");
    let date;

    if (msg.id) {
        date = new Date(+msg.id).toLocaleString();
    } else {
        date = new Date().toLocaleString();
    }

    li.innerHTML = users[msg.author] + ' [' + date + ']: <br>' + msg.message;
    if (+msg.receiver === 0) {
        document.getElementById('userChatId0').appendChild(li);
    } else if (+msg.author === me) {
        document.getElementById('userChatId' + msg.receiver).appendChild(li);
    } else {
        document.getElementById('userChatId' + msg.author).appendChild(li);
    }
};

const chooseChat = event => {
    document.querySelector('.selected').classList.remove('selected');
    event.target.classList.add('selected');
    let userId = +event.target.id.match(/[0-9]/g);
    Array.from(document.getElementById('chat-window').children).forEach(el => el.style.display = 'none');
    document.getElementById('chatId' + userId).style.display = '';
}