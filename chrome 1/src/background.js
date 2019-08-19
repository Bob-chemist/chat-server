chrome.alarms.create('1min', {
  // Повторяем код ниже каждую минуту
  delayInMinutes: 1,
  periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === '1min') {
  }
});

var curDate = new Date();

function showNotification(data) {
  // показываем уведомление, состоящее их названия предмета и баллов
  if (data.length > 1) {
    data = data.map(m => {
      return { title: m.title, message: m.message };
    });

    chrome.notifications.create('reminder', {
      type: 'list',
      iconUrl: 'icon.png',
      title: 'Новые сообщения',
      items: data,
      message: 'test',
      requireInteraction: true,
    });
  } else {
    chrome.notifications.create('reminder', {
      type: 'basic',
      iconUrl: 'icon.png',
      title: data[0].title,
      message: data[0].message,
      requireInteraction: true,
    });
  }
}

// setInterval(() => {
//     fetch('http://192.168.84.136:3000/messages')
//         .then(response => {
//             return response.json();
//         })
//         .then(data => {
//             if (data.length) {
//                 showNotification(data);
//             }
//         });
// }, 5000);
