/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import Action from '../../../../src/actions/index.js'
import { AudioAction } from '../../../../src/actions/audio'

import audios from '../../../../src/actions/audio/audios.js'

const audioPlay = require('play-sound')

jest.mock('play-sound', () => ({
    play: jest.fn(),
    kill: jest.fn(),
}))


describe('Testing Audios', () => {
    it('Creates an AudioAction Instance', () => {
        expect(new AudioAction('test', false)).toBeDefined()
    })
    it('Creates an AudioAction Instance', () => {
        expect(new AudioAction('sound', 'test')).toBeDefined()
    })
    it('Expects audios to contain properties', () => {
        let result = audios.reduce((anterior, atual) => {
            return anterior && ('label' in atual && 'value' in atual)
        }, true)
        expect(result).toBe(true)
    })
    it('Expect do on function to start playing', () => {
        let audio = new AudioAction('sound', 'elevator-bossa-nova.mp3')
        audio.do()
        expect(audioPlay.play).toHaveBeenCalled()
        audio.stop()
    })
})
