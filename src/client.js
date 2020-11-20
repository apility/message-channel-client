const createSocket = (channel, topic, handler) => {
  const socket = new WebSocket(`wss:/broadcast.netflexapp.com?channel=${channel}${topic ? `&topic=${topic}` : ''}`)
  socket.onmessage = handler

  return socket
}

export default class MessageChannel {
  constructor(channel, topic = undefined) {
    this.clientId = undefined
    this.listeners = []

    const handler = message => {
      const parsedMessage = JSON.parse(message.data)

      if (parsedMessage.event === 'connected') {
        this.clientId = parsedMessage.clientId
        this.fireEvent('connected',  this)
        this.fireEvent('connect',  this)
      }

      this.fireEvent('event', parsedMessage)
    }

    let timeout = 1

    const connect = () => {
      this.socket = createSocket(channel, topic, handler)

      this.socket.onopen = () => {
        timeout = 1
      }

      this.socket.onclose = () => {
        this.socket.close()
        timeout *= 10
        setTimeout(() => connect(), timeout)
        console.warn('Socket was unexpectedly closed')
      }

      this.socket.onerror = error => {
        this.socket.close()
        timeout *= 10
        setTimeout(() => connect(), timeout)
        console.error(error)
      }
    }

    connect()
  }

  static connect (channel, topic = undefined) {
    const client = new MessageChannel(channel, topic)
    return new Promise(resolve => {
      client.on('connected', resolve)
    })
  }

  fireEvent(event, message) {
    this.listeners.filter(listener => listener.event === event).forEach(listener => {
      listener.handler(message)
    })
  }

  sendCommand(type, value) {
    this.socket.send(JSON.stringify({ type, value }))
  }

  sendMessage(value) {
    this.sendCommand('message', value)
  }

  setTopic(topic) {
    this.sendCommand('setTopic', topic)
  }

  on(event, handler) {
    this.listeners.push({
      event,
      handler
    })
  }
}
