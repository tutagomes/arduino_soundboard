import { AudioAction } from '../actions/audio'
import { KeysAction } from '../actions/keys'
import Action from '../actions/index.js'
import notify from '../notifications'
const LocalStorage = require('node-localstorage').LocalStorage
import { app } from 'electron'

class ActionController {
  constructor (load = true, notifications = false, customPath = false) {
    if (customPath) {
      this.localStorage = new LocalStorage('./saved-actions')
    } else {
      this.localStorage = new LocalStorage(app.getPath('userData') + './saved-actions')
    }

    this.actions = {}
    this.mode = 1
    this.notifications = notifications
    if (load) { this.loadActions() }
  }

  execute (key) {
    if (!(this.mode in this.actions) || !(key in this.actions[this.mode])) {
      return
    }
    if (this.actions[this.mode][key].intent === 'changeMode') {
      if (this.actions[this.mode][key].payload === 'toggle') {
        if (this.mode === 1) {
          this.mode = 2
        } else {
          this.mode = 1
        }
      } else {
        this.mode = parseInt(this.actions[this.mode][key].payload)
      }
    } else {
      console.log(this.mode, key, this.actions[this.mode][key])
      this.actions[this.mode][key].do()
    }
  }

  disableNotifications () {
    this.notifications = false
  }

  enableNotifications () {
    notify('Notificações Ativadas', 'As notificações foram ativadas')
    this.notifications = true
  }

  toggleNotifications () {
    this.notifications = !this.notifications
    if (this.notifications) {
      notify('Notificações Ativadas', 'As notificações foram ativadas')
    } else {
      notify('Notificações Desativadas', 'As notificações foram desativadas')
    }
    return this.notifications
  }

  stop (key) {
    if (!(this.mode in this.actions) && !(key in this.actions[this.mode])) {
      return
    }
    this.actions[key][this.mode].stop()
  }

  setAction (key, action) {
    if (!(this.actions[this.mode])) {
      this.actions[this.mode] = {}
    }
    this.actions[this.mode][key] = action
    this.saveActions()
  }

  addAction (key, type, name, payload, mode = this.mode) {
    if (!(this.actions[mode])) {
      this.actions[mode] = {}
    }
    if (type === 'sound') {
      this.actions[mode][key] = new AudioAction(name, payload)
    } else if (type === 'keys') {
      this.actions[mode][key] = new KeysAction(name, payload)
    } else if (type === 'changeMode') {
      this.actions[mode][key] = new Action('changeMode', payload)
    }
    this.saveActions()
  }

  setMode (mode = 1) {
    if (this.notifications) { notify('Modo ' + mode + ' ativado!', `O modo ${mode} está ativo`) }
    this.mode = mode
    return this.mode
  }

  getMode () {
    return this.mode
  }

  loadActions (clearOnFail = true) {
    try {
      const actions = this.localStorage.getItem('acoes') ? JSON.parse(this.localStorage.getItem('acoes')) : {}
      if (actions) {
        for (const acaoDoModo in actions) {
          for (const key in actions[acaoDoModo]) {
            this.addAction(key, actions[acaoDoModo][key].type, actions[acaoDoModo][key].name, actions[acaoDoModo][key].payload, acaoDoModo)
          }
        }
      }
    } catch (e) {
      if (clearOnFail) { this.clearActions() }
    }
  }

  saveActions () {
    this.localStorage.setItem('acoes', JSON.stringify(this.actions))
  }

  getKeyAction (key) {
    if (this.actions && this.actions[this.mode]) {
      if (key.name in this.actions[this.mode]) {
        return this.actions[this.mode][key.name]
      }
    }
    return false
  }

  clearActions () {
    this.localStorage.clear()
    this.loadActions()
  }
}
export default ActionController
