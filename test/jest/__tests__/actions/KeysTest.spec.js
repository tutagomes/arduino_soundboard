/* eslint-disable */
/**
 * @jest-environment jsdom
 */
// jest.mock('robotjs');

import { KeysAction, Key } from '../../../../src-electron/actions/keys'
const robot = require('robotjs')

jest.mock('robotjs', () => ({
    keyTap: jest.fn(),
    keyPress: jest.fn(),
}))

describe('Testing KeyPress', () => {
    it('Creates an Key Instance', () => {
        expect(new Key('a')).toBeDefined()
    })
    it('Expect to create string and fail, as keys are not strings', () => {
        expect(() => new Key('teste')).toThrowError()
    })
    it('Expect "do" on function to start typing', () => {
        let action = new KeysAction('Type a', [new Key('a')])
        action.do()
        expect(robot.keyTap).toHaveBeenCalled()
        expect(robot.keyPress).not.toHaveBeenCalled()
        expect(robot.keyTap).toHaveBeenCalledWith('a')
    })
    it('Expect "do" on function to start typing', () => {
        let action = new KeysAction('Type b', [new Key('b', 'control')])
        action.do()
        action.stop()
        expect(robot.keyTap).toHaveBeenCalled()
        expect(robot.keyPress).not.toHaveBeenCalled()
        expect(robot.keyTap).toHaveBeenCalledWith('b', 'control')
    })
})
