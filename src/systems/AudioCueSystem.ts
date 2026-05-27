export type AudioCueId = 'ui' | 'dialogue' | 'save' | 'transition';

const cueFrequencies: Record<AudioCueId, number> = {
    ui: 420,
    dialogue: 520,
    save: 660,
    transition: 330
};

let audioContext: AudioContext | undefined;

const getAudioContext = () => {
    const AudioContextConstructor = globalThis.AudioContext
        ?? (globalThis as typeof globalThis & {
            webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

    if (!AudioContextConstructor) {
        return undefined;
    }

    audioContext ??= new AudioContextConstructor();
    return audioContext;
};

export const playAudioCue = (cueId: AudioCueId) => {
    try {
        const context = getAudioContext();

        if (!context) {
            return;
        }

        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const now = context.currentTime;

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(cueFrequencies[cueId], now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.13);
    } catch {
        // Audio is an optional polish hook; failures should never interrupt play.
    }
};
