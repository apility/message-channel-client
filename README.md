# Netflex MessageChannel client

Lets you connect to the Netflex MessageChannel API

## Usage
```javascript
import MessageChannel from '@apility/message-channel'

let channelKey = '00000000-0000-0000-0000-000000000000' // Can be generated server side, or provided manually

const channel = new MessageChannel(channelKey)

channel.on('message', message => console.log(message))
```

## Promise based factory

You can alternatively use the static connect method

```javascript
const channel = await MessageChannel.connect(channelKey, 'public')
```

## Listening for a specific topic

```javascript
const channel = new MessageChannel(channelKey, 'news')

// or

channel.on('connect', () => {
  channel.setTopic('news')
})
```

