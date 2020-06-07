// eslint-disable-next-line no-undef
// const opts = {}
// var player = require('play-sound')(opts)
import Action from '../index'

var path = require('path')

class AudioAction extends Action {
  constructor (name, payload, repeat = false, times = 0, delay = 500) {
    super(name, payload, repeat, times, delay)
    this.intent = name
    this.payload = payload
    this.type = 'sound'
  }

  do () {
    playAudio(this.payload)
  }

  stop () {
    playAudio()
  }
}

var playing

function playAudio (audio = false) {
  if (playing) {
    playing.pause()
  }
  if (audio) {
    const audioFolder = path.join('statics', 'audios', audio)
    playing = new Audio(audioFolder)
    playing.play()
  }
}

export { playAudio, AudioAction }
