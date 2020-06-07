<template>
  <q-page class="" style=''>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        v-model="selectModeFab"
        :label="`Alterar Modo (${mode + 1})`"
        label-position="right"
        :color="mode === 0 ? 'primary' : 'secondary'"
        icon="keyboard_arrow_left"
        direction="left"
      >
        <q-fab-action color="primary" @click="mode = 0" label="Modo 1" />
        <q-fab-action color="secondary" @click="mode = 1" label="Modo 2" />
        <q-fab-action color="red" @click="clearAll()" label="Limpar Modos" />
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 18]">
      <q-btn round :color="$q.dark.isActive ? 'grey-9' : 'primary'" :icon="$q.dark.isActive ? 'wb_sunny' : 'brightness_3'" class="rotate-45" @click="toggleDarkMode()"/>
    </q-page-sticky>
    <q-dialog v-model='actionDialog' full-width full-height>
      <q-card class='full-width justify-center' style='text-align: center'>
        <q-tabs
        v-model="action_select_tab"
        class="text-primary"
      >
        <q-tab name="sound" icon="volume_up" label="Sons" />
        <q-tab name="keys" icon="keyboard" label="Teclas/Macro" />
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
          <q-tab-panel name="keys">
            <center>
              <div class='justify-center'>
                  <div class="q-pa-lg q-gutter-sm" style='width: 400px'>
                    <q-input filled v-model="nomeActionKeys" full-width label="Nome da Macro" />
                    <q-select
                      filled
                      v-model="selectedActionKey"
                      use-input
                      full-width
                      hide-selected
                      fill-input
                      input-debounce="0"
                      :options="actionKeysOptions"
                      @filter="actionKeysFilter"
                      label="Tecla"
                    />
                    <q-select
                      v-if='selectedActionKey !== "delay"'
                      filled
                      v-model="selectedModifier"
                      multiple
                      full-width
                      :options="modifiersKeys"
                      label="Modificadores"
                    />
                    <q-input v-else filled v-model="delayTime" full-width label="Tempo de Delay em (ms)" type="number" />
                    <span class='text-h6'>{{ selectedModifier.length ? selectedModifier.join(' + ') +  ' +' : ''}} {{selectedActionKey}}</span>
                    <br>
                    <q-btn icon='add' label='Adicionar Tecla à Lista' color='positive' full-width @click='actionKeysList.push(createKey())'/>
                  </div>
                  <span v-if='!actionKeysList.length'>Nenhuma tecla na lista</span>
                  <q-list bordered separator style='width: 400px; margin-bottom: 30px' dense>
                    <q-item clickable v-ripple v-for='(key, index) in actionKeysList' :key='key.keyName + "-" + index'>
                      <q-item-section>{{ key.getFormatted() }}</q-item-section>
                      <q-item-section side><q-btn color='red' icon='delete' @click="actionKeysList.splice(index, 1)" flat/></q-item-section>
                    </q-item>
                  </q-list>
              </div>
              <q-separator/>
            </center>
          </q-tab-panel>
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
        <q-btn label="Adicionar Ação" color='primary' :disable="action_select_tab === 'keys' && !actionKeysList.length" @click="addAction()"/>
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
        <q-btn v-if='buttonHasAction(key)' style='margin: 5px; font-size: 0.4em' class='full-width full-height' :color='key.color' :text-color='key.text' :label='actions[mode][key.name].name' @click='initAdd(key)'/>
        <q-btn v-else style='margin: 5px; font-size: 2em' class='full-width full-height' :color='key.color' :text-color='key.text' :label='key.name' @click='initAdd(key)'/>
      </div>
    </div>
    </div>
    </center>
  </q-page>
</template>

<script>
import keyboardDefault from '../actions/keyboard.js'
import audiosDefault from '../actions/audio/audios.js'
import { AudioAction, playAudio } from '../actions/audio'
import { keys as actionKeys, modifiers as modifiersKeys } from '../actions/keys/keys.js'
import { KeysAction, Key } from '../actions/keys/index.js'

import Action from '../actions'
// import notification from '../notifications'
import { remote } from 'electron'
// import { getPorts } from '../serial'
// import { Serial } from '../serial'
export default {
  name: 'PageIndex',
  data () {
    return {
      // Teclas do teclado que aparecem
      keys: keyboardDefault,
      // Áudios para serem selecionados
      audios: audiosDefault,
      // Parte de controle de ações de tecla
      nomeActionKeys: '',
      actionKeys: actionKeys,
      actionKeysOptions: null,
      modifiersKeys: modifiersKeys,
      selectedActionKey: null,
      selectedModifier: [],
      delayTime: 250,
      actionKeysList: [],
      // Parte de controle de ações e portas e modos
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
    createKey () {
      if (this.selectedActionKey === 'delay') {
        return new Key(this.selectedActionKey, [this.delayTime])
      }
      return new Key(this.selectedActionKey, this.selectedModifier)
    },
    actionKeysFilter (val, update, abort) {
      update(() => {
        const needle = val.toLowerCase()
        this.actionKeysOptions = this.actionKeys.filter(v => v.toLowerCase().indexOf(needle) > -1)
      })
    },
    clearAll () {
      this.$q.dialog({
        title: 'Confirmar',
        message: 'Deseja limpar todos os binds de tecla de todos os modos?',
        cancel: true
      }).onOk(() => {
        this.$q.localStorage.remove('acoes')
        this.carregarAcoes()
      })
    },
    toggleDarkMode () {
      this.$q.dark.toggle()
    },
    carregarAcoes () {
      this.actions = this.$q.localStorage.getItem('acoes') ? this.$q.localStorage.getItem('acoes') : {}
      console.log(this.actions)
      if (this.actions) {
        for (const key in this.actions) {
          for (const acaoDoModo in this.actions[key]) {
            console.log('Criando ação com', this.actions[key][acaoDoModo].type)
            if (this.actions[key][acaoDoModo].type === 'sound') {
              this.actions[key][acaoDoModo] = new AudioAction(this.actions[key][acaoDoModo].name, this.actions[key][acaoDoModo].payload)
            } else if (this.actions[key][acaoDoModo].type === 'keys') {
              this.actions[key][acaoDoModo] = new KeysAction(this.actions[key][acaoDoModo].name, this.actions[key][acaoDoModo].payload)
            } else if (this.actions[key][acaoDoModo].type === 'generic') {
              this.actions[key][acaoDoModo] = new Action('changeMode', this.actions[key][acaoDoModo].payload)
            }
          }
        }
      }
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
        this.actions[this.mode][key].do()
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
        this.actions[this.mode][this.selectedKey.name] = new AudioAction('Sound' + '-' + this.audio.label, this.audio.value)
      }
      if (this.action_select_tab === 'keys') {
        this.actions[this.mode][this.selectedKey.name] = new KeysAction(this.nomeActionKeys, this.actionKeysList)
        this.actionKeysList = []
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
