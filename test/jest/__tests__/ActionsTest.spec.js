/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import { Action, doAction } from '../../../src/actions/index'

describe('Testing Actions', () => {
    it('Creates an Actions Instance', () => {
        expect(new Action('sound', 'test')).toBeDefined()
    })
})
