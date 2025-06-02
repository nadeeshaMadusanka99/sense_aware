import AsyncStorage from '@react-native-async-storage/async-storage';
import { SensorData, Settings } from '../types';

const HISTORY_KEY = 'SENSE_HISTORY';
const SETTINGS_KEY = 'SENSE_SETTINGS';

const StorageService = {
    async save(entry: SensorData) {
        const history = await this.getHistory();
        history.unshift(entry);
        // Keep only last 100 entries
        const trimmed = history.slice(0, 100);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    },

    async getHistory(): Promise<SensorData[]> {
        const data = await AsyncStorage.getItem(HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    },

    async saveSettings(settings: Settings) {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    },

    async getSettings(): Promise<Settings> {
        const data = await AsyncStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : {
            ttsEnabled: true,
            notificationsEnabled: true,
            migraineModeEnabled: false,
            sitThreshold: 15,
        };
    },

    async clearHistory() {
        await AsyncStorage.removeItem(HISTORY_KEY);
    },
};

export default StorageService;