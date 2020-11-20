import MessageChannel from '../src/client.js'

//const channel = new MessageChannel('00000000-0000-0000-0000-000000000000')

//channel.on('connect', ({ clientId }) => console.log(clientId))

const channel = MessageChannel.connect('00000000-0000-0000-0000-000000000000').then(channel => {
    console.log('got channel', channel.clientId)
})