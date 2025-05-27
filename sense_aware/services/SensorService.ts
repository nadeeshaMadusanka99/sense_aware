import { Accelerometer, LightSensor } from 'expo-sensors';
import * as ScreenOrientation from 'expo-screen-orientation';
import StorageService from './StorageService';
import { SensorData } from '../types';

let accelSubscription: { remove: () => void } | null = null;
let lightSubscription: { remove: () => void } | null = null;
let latestLightLevel: number = 100;

function classifyActivity(accel: { x: number, y: number, z: number }): string {
    const magnitude = Math.sqrt(accel.x ** 2 + accel.y ** 2 + accel.z ** 2);
    if (magnitude < 1.2) return 'Sitting';
    if (magnitude < 2) return 'Walking';
    return 'Running';
}

function classifyLight(level: number): string {
    if (level < 10) return 'Low Light';
    if (level > 1000) return 'Bright Light';
    return 'Normal';
}

function classifyOrientation(orientation: ScreenOrientation.Orientation): string {
    return orientation === ScreenOrientation.Orientation.PORTRAIT_UP ? 'Upright' : 'Flat';
}

const SensorService = {
    subscribe(callback: (data: SensorData) => void) {
        lightSubscription = LightSensor.addListener(({ illuminance }) => {
            latestLightLevel = illuminance;
        });

        accelSubscription = Accelerometer.addListener(({ x, y, z }) => {
            const activity = classifyActivity({ x, y, z });
            const light = classifyLight(latestLightLevel);

            ScreenOrientation.getOrientationAsync().then((orientation) => {
                const ori = classifyOrientation(orientation);
                const result: SensorData = { activity, light, orientation: ori, timestamp: new Date().toLocaleString() };
                callback(result);
                StorageService.save(result);
            });
        });
    },

    unsubscribe() {
        if (accelSubscription) accelSubscription.remove();
        if (lightSubscription) lightSubscription.remove();
    }
};

export default SensorService;
