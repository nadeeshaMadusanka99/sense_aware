import * as Speech from 'expo-speech';
import { SensorData } from '../types';

const TTSService = {
    speak({ activity, light, orientation }: SensorData) {
        const msg = `You are ${activity}. The light is ${light}. Orientation is ${orientation}.`;
        Speech.speak(msg);
    }
};

export default TTSService;
