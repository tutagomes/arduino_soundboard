const SerialPort = require('serialport')
var events = require('events')

// const myEmitter = new MyEmitter()

class SerialTalker {
  constructor () {
    this.events = new events.EventEmitter()
    this.port = false
  }

  async listPorts () {
    const ports = await SerialPort.list()
    return ports.map((port) => port.path)
  }

  get connectedPort () {
    if (this.port) {
      this.events.emit('connected', this.port.path)
      return this.port.path
    }
    return false
  }

  async list () {
    return await SerialPort.list()
  }

  connect (port, baudRate) {
    if (this.port) {
      this.port.close()
    }
    this.port = new SerialPort(port, { baudRate: baudRate })
    this.Readline = SerialPort.parsers.Readline
    this.parser = this.port.pipe(new SerialPort.parsers.Readline('\n'))
    this.port.write('b')
    this.port.write('a')
    this.parser.on('data', data => {
      this.events.emit('data', data[0])
    })
    return port
  }

  disconnect () {
    if (this.port) {
      this.port.close()
      this.port = false
      this.events.emit('disconnected')
    }
  }

  write (data) {
    if (this.port) {
      this.port.write(data)
    }
  }
}

export default SerialTalker
