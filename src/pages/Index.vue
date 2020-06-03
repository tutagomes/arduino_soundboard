<template>
  <q-page class="" style='font-size: 2em'>
    <q-dialog v-model='actionDialog' full-width full-height>
      <q-card class='full-width'>
      <div class='row' style='padding: 30px 100px 30px 100px'>
        <div class='col-11'>
          <q-select outlined v-model="audio" :options="audios" label="Label"/>
        </div>
        <div class='col-1'>
          <q-btn flat icon='play_arrow' @click="playAudio()" size='lg' color='primary' v-if="audio"/>
        </div>
        <q-btn label="Adicionar Ação" color='primary' @click="addAction()"/>
      </div>
      </q-card>
    </q-dialog>
     <center>
    <div style='width: 70%; height: 70%; padding-top: 30px'>
    <div class='row q-col-gutter-sm'><div class='col-11'><q-select outlined v-model="selectedPort" dense :options="ports" label="Porta Serial" /></div><div class='col-1'><q-btn label="Select" color='primary' @click="selectPort()"/></div></div>
    <div class='row q-col-gutter-sm' v-for='(row, index) of keys' :key='row + "-" + index' style='padding-top: 5px'>
      <div class='col' v-for='key of row' :key='key.name'>
        <q-btn v-if='buttonHasAction(key)' style='margin: 5px; font-size: 0.4em' class='full-width full-height' :color='key.color' :text-color='key.text' :label='actions[mode][key.name].intent + "-" + actions[mode][key.name].payload' @click='initAdd(key)'/>
        <q-btn v-else style='margin: 5px; font-size: 2em' class='full-width full-height' :color='key.color' :text-color='key.text' :label='key.name' @click='initAdd(key)'/>
      </div>
    </div>
    </div>
    </center>
  </q-page>
</template>

<script>
import keyboardDefault from '../actions/keys'
import audiosDefault from '../audios'
import { playAudio } from '../audios/player'
import { Action, doAction } from '../actions/index.js'
// import notification from '../notifications'
import { remote } from 'electron'
// import { getPorts } from '../serial'
// import { Serial } from '../serial'
export default {
  name: 'PageIndex',
  data () {
    return {
      keys: keyboardDefault,
      audios: audiosDefault,
      selectedKey: null,
      mode: 0,
      audio: null,
      actions: {},
      actionDialog: false,
      selectedPort: null,
      ports: [],
      port: null,
      parser: null,
      readline: null,
      SerialPort: null
    }
  },
  created () {
    this.SerialPort = remote.app.SerialPort
    this.getPorts()
    this.carregarAcoes()
  },
  beforeDestroy () {
    this.port.close()
  },
  methods: {
    carregarAcoes () {
      console.log('Tentando carregar')
      console.log(this.$q.localStorage.getItem('acoes'))
      this.actions = this.$q.localStorage.getItem('acoes') ? this.$q.localStorage.getItem('acoes') : {}
    },
    salvarAcoes () {
      this.$q.localStorage.set('acoes', this.actions)
      console.log('Salvo!')
    },
    initAdd (key) {
      this.actionDialog = true
      this.selectedKey = key
    },
    selectPort () {
      this.port = new this.SerialPort(this.selectedPort, { baudRate: 2000000 })
      this.Readline = this.SerialPort.parsers.Readline
      this.parser = this.port.pipe(new this.SerialPort.parsers.Readline('\n'))
      this.port.write('b')
      this.port.write('a')
      this.parser.on('data', async data => {
        console.log(data)
        this.act(data[0])
      })
    },
    act (key) {
      // notification('Ação', 'Ação')
      if (this.actions[this.mode][key].intent === 'changeMode') {
        if (this.mode === 1) {
          this.mode = 2
        } else {
          this.mode = 1
        }
      } else {
        doAction(this.actions[this.mode][key])
      }
    },
    async getPorts () {
      this.ports = (await this.SerialPort.list()).map((port) => port.comName)
    },
    buttonHasAction (key) {
      if (this.actions && this.mode in this.actions) {
        if (this.actions[this.mode] && key.name in this.actions[this.mode]) {
          return true
        }
      }
      return false
    },
    addAction () {
      if (!(this.mode in this.actions)) {
        this.actions[this.mode] = {}
      }
      this.actions[this.mode][this.selectedKey.name] = new Action('sound', this.audio.value)
      this.actionDialog = false
      this.salvarAcoes()
    },
    playAudio () {
      console.log(this.audio.value)
      playAudio(this.audio.value)
    }
  }
}
</script>

<style >
.col {
  min-height: 120px;
}
</style>
