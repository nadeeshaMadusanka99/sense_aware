import * as Speech from 'expo-speech';
import { SensorData } from '../types';

const TTSService = {
    speak(data: SensorData) {
        const msg = `You are ${data.activity.toLowerCase()}. ` +
            `Light is ${data.light.toLowerCase()}. ` +
            `Sound is ${data.noise.toLowerCase()}.`;
        Speech.speak(msg, { rate: 0.8 });
    },

    speakAlert(message: string) {
        Speech.speak(message, { rate: 0.9, pitch: 1.2 });
    },
};

export default TTSService;
