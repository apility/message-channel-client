const createSocket = (channel, topic, handler, host = null) => {
  host = host ? host : `wss:/${channel}.broadcast.netflexapp.com`
  const socket = new WebSocket(`${host}?channel=${channel}${topic ? `&topic=${topic}` : ''}`)

  socket.onmessage = handler

  return socket
}

export default class MessageChannel {
  constructor(channel, topic = undefined, { pingInterval = 30, host = null }) {
    this.clientId = undefined
    this.listeners = []
    this.keepAlive = null
    this.options = {
      pingInterval,
      host
    }

    const handler = message => {
      const parsedMessage = JSON.parse(message.data)

      if (parsedMessage.event === 'connected') {
        this.clientId = parsedMessage.clientId
        this.fireEvent('connected',  this)
        this.fireEvent('connect',  this)
      }

      if (parsedMessage.event) {
        this.fireEvent(parsedMessage.event, parsedMessage)
      }

      if (parsedMessage.data && parsedMessage.data.event) {
        this.fireEvent(parsedMessage.data.event, parsedMessage.data)
      }

      this.fireEvent('message', parsedMessage)
    }

    let timeout = 1

    const connect = () => {
      if (this.keepAlive) {
        clearInterval(this.keepAlive)
      }

      this.socket = createSocket(channel, topic, handler, this.options.host)

      this.socket.onopen = () => {
        timeout = 1

        if (this.keepAlive) {
          clearInterval(this.keepAlive)
        }

        setTimeout(() => {
          this.keepAlive = setInterval(() => this.sendCommand('keep-alive', true), (this.options.pingInterval ? this.options.pingInterval : 30) * 1000)
        })
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

  static connect (channel, topic = undefined, options = {}) {
    const client = new MessageChannel(channel, topic, options)
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
