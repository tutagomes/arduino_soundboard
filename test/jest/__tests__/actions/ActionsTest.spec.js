/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import Action from '../../../../src-electron/actions/index.js'

describe('Testing Actions', () => {
    it('Creates an Actions Instance', () => {
        expect(new Action('test')).toBeDefined()
    })
    it('Expects to throw when doing with default action', () => {
        let action = new Action('anyName', 'anyPayload')
        expect(action).toBeDefined()
        expect(() => action.do()).toThrowError('No action defined')
    })
})
