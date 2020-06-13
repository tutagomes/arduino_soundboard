/* eslint-disable */
/**
 * @jest-environment jsdom
 */
// jest.mock('robotjs');

import notification from '../../../../src-electron/notifications/index.js'
const notifier = require('node-notifier')

jest.mock('node-notifier', () => ({
    notify: jest.fn()
}))

describe('Testing Notification', () => {
    it('Expect Message and title to be shown', () => {
        let parameters = {
            title: 'ASDFASDF',
            message: 'ASDFASDFASDF',
            icon: './icone.png',
            contentImage: './icone.png',
            sound: 'Hero'
        }
        notification(parameters.title, parameters.message)
        expect(notifier.notify).toHaveBeenCalled()
        expect(notifier.notify).toHaveBeenCalledWith(parameters)
    })
})
