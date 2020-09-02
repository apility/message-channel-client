const createSocket = (channel, topic, handler) => {
  const socket = new WebSocket(`wss:/broadcast.netflexapp.com?channel=${channel}${topic ? `&topic=${topic}` : ''}`)
  socket.onmessage = handler

  return socket
}

class MessageChannel {
  constructor(channel, topic = undefined) {
    this.listeners = []

    const handler = message => {
      const parsedMessage = JSON.parse(message.data)
      this.listeners.filter(listener => listener.event === 'message').forEach(listener => {
        listener.handler(parsedMessage)
      })
    }

    let timeout = 1

    const connect = () => {
      this.socket = createSocket(channel, topic, handler)

      this.socket.onopen = () => {
        timeout = 1
        this.listeners.filter(listener => listener.event === 'connected').forEach(listener => {
          listener.handler(this)
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
