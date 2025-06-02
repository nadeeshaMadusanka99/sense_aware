import {
    Accelerometer,
    LightSensor,
    DeviceMotion,
    DeviceMotionMeasurement,
} from 'expo-sensors';
import { Audio } from 'expo-av';
import StorageService from './StorageService';
import { SensorData } from '../types';

let accelSub: any = null;
let lightSub: any = null;
let noiseInterval: any = null;
let motionSub: any = null;

let lightLevel: number = 100;
let noiseLevel: number = 0;
let currentOrientation: string = 'Unknown';

const accelBuffer: number[] = [];

const getVariance = (buffer: number[]): number => {
    if (buffer.length === 0) return 0;
    const mean = buffer.reduce((a, b) => a + b, 0) / buffer.length;
    return buffer.reduce((a, b) => a + (b - mean) ** 2, 0) / buffer.length;
};

const classifyActivity = (accVar: number): string => {
    if (accVar < 0.02) return 'Sitting';
    if (accVar < 0.1) return 'Walking';
    return 'Running';
};

const classifyLight = (level: number): string => {
    if (level < 10) return 'Dark';
    if (level < 20) return 'Dim';
    if (level < 100) return 'Normal';
    return 'Bright';
};

const classifyNoise = (level: number): string => {
    if (level < 30) return 'Very Quiet';
    if (level < 50) return 'Quiet';
    if (level < 70) return 'Moderate';
    if (level < 85) return 'Loud';
    return 'Very Loud';
};

const classifyOrientation = (motion: DeviceMotionMeasurement): string => {
    const { accelerationIncludingGravity } = motion;
    if (!accelerationIncludingGravity) return 'Unknown';

    const { x, y, z } = accelerationIncludingGravity;

    if (z < -0.8) return 'Face Up';
    if (z > 0.8) return 'Face Down';
    if (Math.abs(x) > 0.8) return x > 0 ? 'Left' : 'Right';
    if (Math.abs(y) > 0.8) return y > 0 ? 'Upside Down' : 'Upright';

    return 'Flat';
};

const SensorService = {
    async startMonitoring() {
        const { status } = await Audio.requestPermissionsAsync();
        if (status === 'granted') {
            let simulatedNoise = 40;
            let targetNoise = 40;
            let targetChangeCountdown = 0;

            noiseInterval = setInterval(() => {
                if (targetChangeCountdown <= 0) {
                    const roll = Math.random();
                    if (roll < 0.5) targetNoise = 30 + Math.random() * 10;       // Quiet
                    else if (roll < 0.8) targetNoise = 55 + Math.random() * 10;  // Moderate
                    else targetNoise = 75 + Math.random() * 15;                  // Loud
                    targetChangeCountdown = 25;
                } else {
                    targetChangeCountdown--;
                }

                simulatedNoise += (targetNoise - simulatedNoise) * 0.05;
                noiseLevel = simulatedNoise;
            }, 200);
        }
    },

    async subscribe(callback: (data: SensorData) => void) {
        await this.unsubscribe();
        await this.startMonitoring();

        Accelerometer.setUpdateInterval(200);
        DeviceMotion.setUpdateInterval(200);

        if (LightSensor?.addListener) {
            lightSub = LightSensor.addListener((data: { illuminance: number }) => {
                if (data?.illuminance != null) {
                    lightLevel = data.illuminance;
                }
            });
        }

        motionSub = DeviceMotion.addListener((motion: DeviceMotionMeasurement) => {
            currentOrientation = classifyOrientation(motion);
        });

        accelSub = Accelerometer.addListener(({ x, y, z }) => {
            const mag = Math.sqrt(x * x + y * y + z * z);

            if (accelBuffer.length >= 50) accelBuffer.shift();
            accelBuffer.push(mag);

            const accVar = getVariance(accelBuffer);

            const result: SensorData = {
                activity: classifyActivity(accVar),
                light: classifyLight(lightLevel),
                noise: classifyNoise(noiseLevel),
                orientation: currentOrientation,
                timestamp: new Date().toISOString(), // ✅ Fixed: ISO format
            };

            callback(result);
            StorageService.save(result);
        });
    },

    async unsubscribe() {
        accelSub?.remove(); accelSub = null;
        lightSub?.remove(); lightSub = null;
        motionSub?.remove(); motionSub = null;

        if (noiseInterval) {
            clearInterval(noiseInterval);
            noiseInterval = null;
        }

        accelBuffer.length = 0;
    },
};

export default SensorService;
