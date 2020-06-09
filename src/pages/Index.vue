<template>
  <q-page class="" style=''>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        v-model="selectModeFab"
        :label="`Alterar Modo (Ativo: ${mode})`"
        label-position="right"
        color="primary"
        icon="keyboard_arrow_left"
        direction="left"
      >
        <q-fab-action color="primary" @click="setMode(1)" label="Modo 1" />
        <q-fab-action color="primary" @click="setMode(2)" label="Modo 2" />
        <q-fab-action color="red" @click="clearAll()" label="Limpar Modos" />
      </q-fab>
    </q-page-sticky>
    <q-page-sticky position="top-right" :offset="[18, 18]" class=''>
      <center>
        <q-btn round flat color='primary' icon='visibility_off' @click="hideWindow()"/>
        <br>
        <br>
        <q-btn round :color="$q.dark.isActive ? 'grey-9' : 'primary'" :icon="$q.dark.isActive ? 'wb_sunny' : 'brightness_3'" class="rotate-45" @click="toggleDarkMode()"/>
        <br>
        <br>
        <q-btn v-if="notificationStatus" flat color='primary' icon="notifications_active" @click="toggleNotification"/>
        <q-btn v-else flat color='primary' icon="notifications_off" @click="toggleNotification"/>
      </center>
    </q-page-sticky>
    <q-dialog v-model='actionDialog' full-width full-height>
      <q-card class='full-width justify-center' style='text-align: center'>
        <q-tabs
        v-model="action_select_tab"
        class="text-primary"
      >
        <q-tab name="sound" icon="volume_up" label="Sons" />
        <q-tab name="keys" icon="keyboard" label="Teclas/Macro" />
        <q-tab name="changeMode" icon="settings" label="Modo" />
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
              <div class='justify-center row q-col-gutter-sm'>
                  <div class="col q-gutter-sm">
                    <q-input filled v-model="nomeActionKeys" full-width label="Nome da Macro" />
                    <q-separator/>
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
                  </div>
                  <div class='col q-gutter-sm'>
                    <span class='text-h6'>{{ selectedModifier.length ? selectedModifier.join(' + ') +  ' +' : ''}} {{selectedActionKey}}</span>
                    <br>
                    <q-btn icon='add' label='Adicionar Tecla à Lista' color='positive' :disabled="!selectedActionKey" full-width @click='actionKeysList.push(createKey())'/>
                    <br>
                  <span v-if='!actionKeysList.length'>Nenhuma tecla na lista</span>
                  <q-list bordered separator style='width: 400px; margin-bottom: 30px' dense>
                    <q-item clickable v-ripple v-for='(key, index) in actionKeysList' :key='key.keyName + "-" + index'>
                      <q-item-section>{{ key.getFormatted() }}</q-item-section>
                      <q-item-section side><q-btn color='red' icon='delete' @click="actionKeysList.splice(index, 1)" flat/></q-item-section>
                    </q-item>
                  </q-list>
                  </div>
              </div>
              <q-separator/>
            </center>
          </q-tab-panel>
          <q-tab-panel name="changeMode">
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
        <div class='col' v-if='!SerialPort.connectedPort'>
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
        <q-btn v-if='getKeyAction(key)' style='margin: 5px; font-size: 0.4em' class='full-width full-height' :color='key.color' :text-color='key.text' :label='getKeyAction(key).name' v-touch-hold.mouse="event => handleActionHold(key, event)" @click='executeAction(key)'/>
        <q-btn v-else style='margin: 5px; font-size: 2em' class='full-width full-height' :color='key.color' :text-color='key.text' :label='key.name' @click='initAdd(key)' v-touch-hold.mouse="event => handleActionHold(key, event)"/>
      </div>
    </div>
    </div>
    </center>
  </q-page>
</template>

<script>
import keyboardDefault from '../actions/keyboard.js'
import audiosDefault from '../actions/audio/audios.js'
import { playAudio } from '../actions/audio'
import { keys as actionKeys, modifiers as modifiersKeys } from '../actions/keys/keys.js'
import { Key } from '../actions/keys/index.js'

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
      selectedActionKey: false,
      selectedModifier: [],
      delayTime: 250,
      actionKeysList: [],
      // Parte de controle de ações e portas e modos
      selectedKey: null,
      audio: null,
      actionDialog: false,
      selectedPort: null,
      ports: [],
      SerialPort: null,
      action_select_tab: 'sound',
      selectModeFab: false,
      modeSelectedAction: '0',
      actionController: null,
      notificationStatus: false,
      mode: 1
    }
  },
  created () {
    this.SerialPort = remote.app.SerialTalker
    this.actionController = remote.app.ActionController
    this.getPorts()
    // this.carregarAcoes()
  },
  beforeDestroy () {
    this.SerialPort.disconnect()
  },
  computed: {
    actions () {
      return remote.app.ActionController.actions
    }
  },
  methods: {
    hideWindow () {
      remote.app.toggleWindow()
    },
    toggleNotification () {
      this.notificationStatus = remote.app.ActionController.toggleNotifications()
    },
    getKeyAction (key) {
      return remote.app.ActionController.getKeyAction(key)
    },
    handleActionHold (key, evt) {
      this.actionDialog = true
      this.selectedKey = key
    },
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
        remote.app.ActionController.clearActions()
        this.$forceUpdate()
      })
    },
    toggleDarkMode () {
      this.$q.dark.toggle()
    },
    setMode (mode) {
      this.mode = remote.app.ActionController.setMode(mode)
    },
    carregarAcoes () {
      remote.app.ActionController.loadActions()
    },
    salvarAcoes () {
      remote.app.ActionController.saveActions()
      console.log('Salvo!')
    },
    initAdd (key) {
      this.actionDialog = true
      this.selectedKey = key
    },
    executeAction (key) {
      console.log('Teste')
      remote.app.ActionController.execute(key.name)
    },
    selectPort () {
      this.SerialPort.connect(this.selectedPort, 2000000)
      this.$forceUpdate()
    },
    closePort () {
      this.SerialPort.disconnect()
      this.selectedPort = null
    },
    async getPorts () {
      this.ports = await this.SerialPort.listPorts()
    },
    addAction () {
      if (this.action_select_tab === 'sound') {
        remote.app.ActionController.addAction(this.selectedKey.name, this.action_select_tab, 'Sound' + ' - ' + this.audio.label, this.audio.value)
      }
      if (this.action_select_tab === 'keys') {
        remote.app.ActionController.addAction(this.selectedKey.name, this.action_select_tab, this.nomeActionKeys, this.actionKeysList)
        this.actionKeysList = []
      }
      if (this.action_select_tab === 'changeMode') {
        remote.app.ActionController.addAction(this.selectedKey.name, this.action_select_tab, 'changeMode', this.modeSelectedAction)
      }
      this.actionDialog = false
      this.$forceUpdate()
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
