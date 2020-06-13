/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import ActionController from '../../../../src-electron/actionController/index.js'

const LocalStorage = require('node-localstorage').LocalStorage
const notifier = require('node-notifier')


jest.mock('node-localstorage', () => ({
    LocalStorage: jest.fn()
}))

jest.mock('node-notifier', () => ({
    notify: jest.fn()
}))

describe('Testing ActionController', () => {
    it('Creates an ActionController Instance', () => {
        expect(new ActionController(false, false, true)).toBeDefined()
    })
    it('Expects to list connected ports', () => {
        let controller = new ActionController(false, false, true)
        controller.disableNotifications()
        expect(controller.notifications).toBe(false)

        controller.enableNotifications()
        expect(controller.notifications).toBe(true)

        // controller.loadActions(false)
        // expect(LocalStorage.getItem).toHaveBeenCalled()

        // controller.saveActions()
        // expect(LocalStorage.setItem).toHaveBeenCalled()
    })

})
