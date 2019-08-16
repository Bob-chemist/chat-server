let app = new Vue({
    el: '#app',
    data: {
        message: ''
    },
    methods: {
        sendMessage: function() {
            let i = document.querySelector('input');

            i.innerHTML = '123';
            i.innerText = '123';
            // t = document.querySelector('textarea');

            fetch('http://localhost:3000/messages/sendmessage', {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                mode: 'cors', // no-cors, cors, *same-origin
                cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
                headers: {
                    'Accept': 'application/json; charset=utf-8',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({title: i.value, message: this.message})
            })
                .then(response => {
                    return response.json();
                })
                .then(data => {
                    // showNotification(data.title, data.message);
                    this.message = '';
                    i.value = '';
                });
        }
    }
});


function sendMsg() {
    let i = document.querySelector('input');
    let text = document.querySelector('textarea');

    
    // t = document.querySelector('textarea');

    fetch('http://localhost:3000/messages/sendmessage', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, cors, *same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {
            'Accept': 'application/json; charset=utf-8',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({title: i.value, message: text.value})
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            // showNotification(data.title, data.message);
            text.value = '';
            i.value = '';
        });
}
// document.addEventListener('DOMContentLoaded', function () {
//     document.querySelector('button').addEventListener('click', sendMessage);
// });