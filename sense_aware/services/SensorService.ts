import { Accelerometer, LightSensor } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Audio } from 'expo-av';
import StorageService from './StorageService';
import { SensorData } from '../types';

let accelSub: any = null;
let lightSub: any = null;
let noiseInterval: any = null;
let lightLevel = 100;
let noiseLevel = 0;

// Classify activity based on accelerometer magnitude
const classifyActivity = (accel: any) => {
    const mag = Math.sqrt(
        accel.x ** 2 + accel.y ** 2 + accel.z ** 2
    );
    if (mag < 1.2) return 'Sitting';
    if (mag < 2) return 'Walking';
    if (mag < 3.5) return 'Running';
    return 'Vehicle';
};

// Classify light intensity
const classifyLight = (level: number) => {
    if (level < 10) return 'Dark';
    if (level < 100) return 'Dim';
    if (level < 1000) return 'Normal';
    return 'Bright';
};

// Classify simulated noise level
const classifyNoise = (level: number) => {
    if (level < 30) return 'Quiet';
    if (level < 70) return 'Normal';
    if (level < 85) return 'Loud';
    return 'Very Loud';
};

// Classify orientation value
const classifyOrientation = (ori: ScreenOrientation.Orientation) => {
    const orientations: { [key in ScreenOrientation.Orientation]?: string } = {
        [ScreenOrientation.Orientation.PORTRAIT_UP]: 'Upright',
        [ScreenOrientation.Orientation.PORTRAIT_DOWN]: 'Upside Down',
        [ScreenOrientation.Orientation.LANDSCAPE_LEFT]: 'Left',
        [ScreenOrientation.Orientation.LANDSCAPE_RIGHT]: 'Right',
    };
    return orientations[ori] || 'Flat';
};

const SensorService = {
    // Simulated noise monitoring setup
    async startMonitoring() {
        const { status } = await Audio.requestPermissionsAsync();
        if (status === 'granted') {
            noiseInterval = setInterval(() => {
                noiseLevel = Math.random() * 100;
            }, 1000);
        } else {
            console.warn('Audio permission not granted.');
        }
    },

    // Subscribe to sensors
    async subscribe(callback: (data: SensorData) => void) {
        await this.startMonitoring();

        Accelerometer.setUpdateInterval(1000);

        // Light sensor subscription (if supported)
        if (LightSensor?.addListener) {
            lightSub = LightSensor.addListener(({ illuminance }) => {
                lightLevel = illuminance;
            });
        } else {
            console.warn('LightSensor not available on this device.');
        }

        // Accelerometer listener
        accelSub = Accelerometer.addListener(({ x, y, z }) => {
            const activity = classifyActivity({ x, y, z });
            const light = classifyLight(lightLevel);
            const noise = classifyNoise(noiseLevel);

            ScreenOrientation.getOrientationAsync().then((ori) => {
                const orientation = classifyOrientation(ori);
                const result: SensorData = {
                    activity,
                    light,
                    noise,
                    orientation,
                    timestamp: new Date().toLocaleString(),
                };
                callback(result);
                StorageService.save(result);
            });
        });
    },

    // Cleanup
    unsubscribe() {
        accelSub?.remove();
        accelSub = null;

        lightSub?.remove();
        lightSub = null;

        if (noiseInterval) {
            clearInterval(noiseInterval);
            noiseInterval = null;
        }
    }
};

export default SensorService;