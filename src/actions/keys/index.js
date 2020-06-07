
import Action from '../index'
const robot = require('robotjs')

class Key {
  constructor (keyName, modifier = []) {
    if (keyName.length > 1 && keyName !== 'delay' && keyName !== 'stop_macros') { throw new Error('Key with multiples characters does not exist') }
    this.keyName = keyName
    this.modifier = modifier
  }

  getFormatted () {
    if (this.keyName === 'delay') {
      return ('Delay de ' + this.modifier[0])
    }
    if (this.keyName === 'stop_macros') {
      return ('Para todos os Macros')
    }
    return (this.modifier.length ? this.modifier.join(' + ') + ' +' : '') + this.keyName
  }
}
function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
var pleaseStop = false

class KeysAction extends Action {
  constructor (name, payload = [], repeat = false, times = 0, delay = 500) {
    super(name, payload, repeat, times, delay)
    this.intent = 'Press - ' + name
    this.payload = payload
    this.type = 'keys'
  }

  async do () {
    pleaseStop = false
    for (const key of this.payload) {
      if (pleaseStop || this.keyName === 'stop_macros') {
        pleaseStop = true
        return
      }
      if (!key.modifier.length) {
        robot.keyTap(key.keyName)
      } else {
        if (key.keyName === 'delay') {
          await sleep(key.modifier[0])
        } else {
          robot.keyTap(key.keyName, key.modifier)
        }
      }
    }
  }

  stop () {
    pleaseStop = true
  }
}

export { KeysAction, Key }
