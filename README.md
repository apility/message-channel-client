# Netflex MessageChannel client

Lets you connect to the Netflex MessageChannel API

## Usage
```javascript
import MessageChannel from '@netflex/message-channel'

let channelKey = '00000000-0000-0000-0000-000000000000' // Can be generated server side, or provided manually

const channel = new MessageChannel(channelKey)

channel.on('message', message => console.log(message))
```

## Listening for a specific topic

```javascript
const channel = new MessageChannel(channelKey, 'news')

// or

channel.on('connect', () => {
  channel.setTopic('news')
})
```
