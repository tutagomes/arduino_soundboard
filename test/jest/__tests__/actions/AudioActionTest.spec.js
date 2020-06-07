/* eslint-disable */
/**
 * @jest-environment jsdom
 */
import Action from '../../../../src/actions/index.js'
import { AudioAction } from '../../../../src/actions/audio'

import audios from '../../../../src/actions/audio/audios.js'

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
        const play = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => {})
        let audio = new AudioAction('sound', 'foobar')
        audio.do()
        expect(play).toHaveBeenCalled()
        play.mockRestore()
    })
    it('Expect stop on function to stop playing', () => {
        let audio = new AudioAction('sound', 'foobar')
        const play = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => {})
        const pause = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
        audio.do()
        expect(play).toHaveBeenCalled()
        audio.stop()
        expect(pause).toHaveBeenCalled()
        play.mockRestore()
        pause.mockRestore()
    })
})
