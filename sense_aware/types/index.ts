export interface SensorData {
    activity: string;
    light: string;
    noise: string;
    orientation: string;
    temperature?: number;
    timestamp: string;
}

export interface Settings {
    ttsEnabled: boolean;
    notificationsEnabled: boolean;
    migraineModeEnabled: boolean;
    sitThreshold: number;
}