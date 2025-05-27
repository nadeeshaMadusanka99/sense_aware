import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import StorageService from '../services/StorageService';
import { SensorData } from '../types';

export default function HistoryScreen() {
    const [history, setHistory] = React.useState<SensorData[]>([]);

    React.useEffect(() => {
        StorageService.getHistory().then(setHistory);
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <Text style={styles.item}>{item.timestamp} - {item.activity} / {item.light} / {item.orientation}</Text>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    item: { padding: 10, fontSize: 16 }
});