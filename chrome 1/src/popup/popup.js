import io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');
const me = chrome.storage.sync.get(['code'], result => result.code);

const users = { [me]: 'Bob' };
const messageInput = document.getElementById('m');
document.getElementById('userNameId0').onclick = event => chooseChat(event);
document.getElementById('sendbutton').onclick = () => send();

messageInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    send();
  }
});

socket.on('connect', () => {
  //При успешном соединении с сервером
  console.info('Connected to server');
  socket.emit('name', me);
});

socket.on('userList', userList => {
  const ul = document.getElementById('users-list'),
    chat = document.getElementById('chat-window');

  userList.forEach(user => {
    users[user.userid] = user.name;

    const li = document.createElement('li');
    li.className = user.connected ? 'online' : '';
    li.innerHTML = user.name;
    li.id = 'userNameId' + user.userid;
    li.onclick = event => chooseChat(event);
    ul.appendChild(li);

    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatId' + user.userid;
    chatWindow.className = 'userchat';
    chatWindow.style.display = 'none';
    chatWindow.innerHTML =
      '' +
      '<h2>' +
      user.name +
      '</h2>' +
      '<ul id="userChatId' +
      user.userid +
      '"></ul>';

    chat.appendChild(chatWindow);
  });
  socket.emit('userList loaded', me);
});

function send() {
  const input = document.getElementById('m'),
    receiver = +document.querySelector('.selected').id.match(/[0-9]/g),
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

socket.on('private message', msg => {
  msg.forEach(el => addMessage(el));
});

socket.on('chat message', msg => {
  msg.forEach(el => addMessage(el));
});

socket.on('user connected', userId => {
  if (userId === me) {
    return;
  }
  document.getElementById('userNameId' + userId).classList.add('online');
});

socket.on('user disconnected', userId => {
  if (userId === me) {
    return;
  }
  document.getElementById('userNameId' + userId).classList.remove('online');
});

const addMessage = msg => {
  const li = document.createElement('li');
  let date;

  if (msg.id) {
    date = new Date(+msg.id).toLocaleString();
  } else {
    date = new Date().toLocaleString();
  }

  li.innerHTML = users[msg.author] + ' [' + date + ']: <br>' + msg.message;
  if (+msg.receiver === 0) {
    document.getElementById('userChatId0').appendChild(li);
    document
      .getElementById('userChatId0')
      .lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else if (+msg.author === me) {
    document.getElementById('userChatId' + msg.receiver).appendChild(li);
    document
      .getElementById('userChatId' + msg.receiver)
      .lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else {
    document.getElementById('userChatId' + msg.author).appendChild(li);
    document
      .getElementById('userChatId' + msg.author)
      .lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};

const chooseChat = event => {
  document.querySelector('.selected').classList.remove('selected');
  event.target.classList.add('selected');
  let userId = +event.target.id.match(/[0-9]/g);
  Array.from(document.getElementById('chat-window').children).forEach(
    el => (el.style.display = 'none'),
  );
  document.getElementById('chatId' + userId).style.display = '';
};
