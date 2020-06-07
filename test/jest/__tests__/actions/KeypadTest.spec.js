/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import keyboard4x4 from '../../../../src/actions/keyboard.js'

describe('Testing Keys Array', () => {
    it('Verifying if is matrix (array inside array)', () => {
        expect(keyboard4x4.length).toBeGreaterThan(0)
        expect(keyboard4x4[0].length).toBeGreaterThan(0)
    })
})
