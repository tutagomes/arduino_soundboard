<template>
  <q-page class="" style=''>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        v-model="selectModeFab"
        :label="`Alterar Modo (${mode + 1})`"
        label-position="right"
        :color="mode === '0' ? 'primary' : 'secondary'"
        icon="keyboard_arrow_left"
        direction="left"
      >
        <q-fab-action color="primary" @click="mode = 0" label="Modo 1" />
        <q-fab-action color="secondary" @click="mode = 1" label="Modo 2" />
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 18]">
      <q-btn round :color="$q.dark.isActive ? 'grey-9' : 'primary'" :icon="$q.dark.isActive ? 'wb_sunny' : 'brightness_3'" class="rotate-45" @click="toggleDarkMode()"/>
    </q-page-sticky>
    <q-dialog v-model='actionDialog' full-width full-height>
      <q-card class='full-width justify-center'>
        <q-tabs
        v-model="action_select_tab"
        class="text-primary"
      >
        <q-tab name="sound" icon="volume_up" label="Sons" />
        <q-tab name="key" icon="keyboard" label="Tecla" />
        <q-tab name="keys" icon="keyboard" label="Macro" />
        <q-tab name="settings" icon="settings" label="Modo" />
      </q-tabs>
         <q-tab-panels v-model="action_select_tab" animated>
          <q-tab-panel name="sound">
              <div class='row' style='padding: 30px 100px 30px 100px'>
              <div class='col-11'>
                <q-select outlined v-model="audio" :options="audios" label="Sons"/>
              </div>
              <div class='col-1'>
                <q-btn flat icon='play_arrow' @click="playAudio()" size='lg' color='primary' v-if="audio"/>
              </div>
            </div>
          </q-tab-panel>
          <q-tab-panel name="key">
            Mussum Ipsum, cacilds vidis litro abertis. Atirei o pau no gatis, per gatis num morreus. Suco de cevadiss deixa as pessoas mais interessantis. Si num tem leite então bota uma pinga aí cumpadi! Manduma pindureta quium dia nois paga.
          </q-tab-panel>
          <q-tab-panel name="keys">
            Mussum Ipsum, cacilds vidis litro abertis. Atirei o pau no gatis, per gatis num morreus. Suco de cevadiss deixa as pessoas mais interessantis. Si num tem leite então bota uma pinga aí cumpadi! Manduma pindureta quium dia nois paga.          </q-tab-panel>
          <q-tab-panel name="settings">
            <center>
              <div class="q-gutter-sm">
                    <q-radio v-model="modeSelectedAction" val="0" label="Modo 1" />
                    <q-radio v-model="modeSelectedAction" val="1" label="Modo 2" />
                    <q-radio v-model="modeSelectedAction" val="toggle" label="Trocar Modo" />
              </div>
            </center>
          </q-tab-panel>
        </q-tab-panels>
      <center>
        <q-btn label="Adicionar Ação" color='primary' @click="addAction()"/>
      </center>
      </q-card>
    </q-dialog>
     <center>
    <div style='width: 70%; height: 70%; padding-top: 30px'>
      <div class='row q-col-gutter-sm'>
        <div class='col' v-if='!port'>
          <q-select filled bottom-slots v-model="selectedPort" :options="ports" label="Porta" dense>
        <template v-slot:before>
          <q-avatar>
            <q-btn round dense flat icon="refresh" @click="getPorts()"/>
          </q-avatar>
        </template>
        <template v-slot:hint>
          Porta USB do Arduino
        </template>
        <template v-slot:after>
          <q-btn round dense flat icon="done" @click="selectPort()"/>
        </template>
      </q-select>
        </div>
        <div v-else class='col'>
          <q-chip size='lg' removable @remove="closePort()">
          <q-avatar icon="memory" color="primary" text-color="white"/>
            Conectado em {{selectedPort}}
          </q-chip>
        </div>
      </div>
      <div class='row q-col-gutter-sm' v-for='(row, index) of keys' :key='row + "-" + index' style='padding-top: 5px; font-size: 2em'>
      <div class='col col-keyboard' v-for='key of row' :key='key.name'>
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
      SerialPort: null,
      action_select_tab: 'sound',
      selectModeFab: false,
      modeSelectedAction: '0'
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
    toggleDarkMode () {
      this.$q.dark.toggle()
    },
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
    closePort () {
      this.port.close()
      this.selectedPort = null
      this.port = null
    },
    act (key) {
      // notification('Ação', 'Ação')
      if (!this.actions[this.mode][key]) {
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
      if (this.action_select_tab === 'sound') {
        this.actions[this.mode][this.selectedKey.name] = new Action('sound', this.audio.value)
      }
      if (this.action_select_tab === 'settings') {
        this.actions[this.mode][this.selectedKey.name] = new Action('changeMode', this.modeSelectedAction)
      }
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
.col-keyboard {
  min-height: 160px;
}
</style>
