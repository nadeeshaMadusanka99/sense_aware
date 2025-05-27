import AsyncStorage from '@react-native-async-storage/async-storage';
import { SensorData } from '../types';

const STORAGE_KEY = 'SENSE_HISTORY';

const StorageService = {
    async save(entry: SensorData) {
        const history = await StorageService.getHistory();
        history.unshift(entry);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    },
    async getHistory(): Promise<SensorData[]> {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }
};

export default StorageService;
