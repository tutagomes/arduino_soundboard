
import Action from '../index'
const robot = require('robotjs')

class Key {
  constructor (keyName, modifier = []) {
    if (keyName.length > 1) { throw new Error('Key with multiples characters does not exist') }
    this.keyName = keyName
    this.modifier = modifier
  }
}

class KeysAction extends Action {
  constructor (name, payload = [], repeat = false, times = 0, delay = 500) {
    super(name, payload, repeat, times, delay)
    this.intent = 'Press - ' + name
    this.payload = payload
  }

  do () {
    for (const key of this.payload) {
      if (!key.modifier.length) {
        robot.keyTap(key.keyName)
      } else {
        robot.keyTap(key.keyName, key.modifier)
      }
    }
  }

  stop () {
  }
}

export { KeysAction, Key }
