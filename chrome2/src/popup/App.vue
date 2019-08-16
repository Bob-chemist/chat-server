<template>
    <div>
        <div>
            <label for="title">Заголовок</label>

            <input id="title">
        </div>

        <div>
            <label for="message">Сообщение</label>

            <textarea id="message" v-on:value="message"></textarea>
        </div>

        <div>
            <button v-on:click="sendMessage">
                Отправить
            </button>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                message: 'mew',
                me: 1
            }
        },
/*        sockets:{
            connect: function(){
                console.log('socket connected')
            },
            customEmit: function(val){
                console.log('this method fired by socket server. eg: io.emit("customEmit", data)')
            }
        },*/
        methods: {
            sendMessage: function() {
                console.log("from sendMessage function");
                const receiver  = 1,
                    message = {
                    author: this.me,
                    message: this.message,
                    receiver,
                },
                    chatType = receiver !== 0 ? 'private message' : 'chat message';
                /*
                                this.$socket.send(chatType, message);

                                var i = document.querySelector('input');

                                i.innerHTML = '123';
                                i.innerText = '123';
                                // t = document.querySelector('textarea');

                                fetch('http://192.168.84.105:3000/messages/sendmessage', {
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
                                    });*/
            }
        }
    }
</script>

<style lang="scss" scoped>
    p {
        font-size: 20px;
    }
</style>
