/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import SerialTalker from '../../../../src-electron/serial/index.js'

const SerialPort = require('serialport')
const events = require('events')

jest.mock('serialport', () => ({
    list: jest.fn(),
    close: jest.fn(),
    write: jest.fn(),
    list: () => [{
        path: 'Port01'
    }],
    SerialPort: {
        constructor: jest.fn()
    }
}))

jest.mock('events', () => ({
    emit: jest.fn(),
    EventEmitter: jest.fn()
}))

describe('Testing SerialTalker', () => {
    it('Creates an SerialTalker Instance', () => {
        expect(new SerialTalker()).toBeDefined()
    })
    it('Expects to list connected ports', async (done) => {
        let serial = new SerialTalker()
        let ports = await serial.listPorts()
        expect(ports).toBeDefined()
        expect(ports).toEqual(["Port01"])
        done()
    })

})
