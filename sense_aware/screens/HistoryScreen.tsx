import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Dimensions,
    Pressable,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import { SensorData } from '../types';

const screenWidth = Dimensions.get('window').width - 40;

export default function HistoryScreen() {
    const [history, setHistory] = useState<SensorData[]>([]);
    const [filtered, setFiltered] = useState<SensorData[]>([]);
    const [filter, setFilter] = useState<'24h' | '7d'>('24h');

    useEffect(() => {
        StorageService.getHistory().then((data) => {
            setHistory(data);
            applyFilter(data, '24h');
        });
    }, []);

    const applyFilter = (data: SensorData[], range: '24h' | '7d') => {
        const cutoff = new Date().getTime() - (range === '24h' ? 24 : 168) * 60 * 60 * 1000;
        const filteredData = data.filter((item) => new Date(item.timestamp).getTime() >= cutoff);
        setFiltered(filteredData);
        setFilter(range);
    };

    const clearHistory = () => {
        Alert.alert('Clear History', 'Are you sure you want to delete all history?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    await StorageService.clearHistory();
                    setHistory([]);
                    setFiltered([]);
                },
            },
        ]);
    };

    const getSummaryData = (key: keyof SensorData) => {
        const summary: { [key: string]: number } = {};
        filtered.forEach((item) => {
            const val = item[key];
            if (val !== undefined) {
                summary[val] = (summary[val] || 0) + 1;
            }
        });
        return Object.entries(summary).map(([name, count]) => ({
            name,
            count,
            color: getColor(name),
            legendFontColor: '#fff',
            legendFontSize: 14,
        }));
    };

    const getColor = (label: string) => {
        const colors: { [key: string]: string } = {
            Sitting: '#FF6B6B',
            Walking: '#4CD964',
            Running: '#FF9500',
            Dark: '#1C1C1E',
            Dim: '#8E8E93',
            Normal: '#5AC8FA',
            Bright: '#FFD60A',
            'Very Quiet': '#34C759',
            Quiet: '#5AC8FA',
            Moderate: '#FF9F0A',
            Loud: '#AF52DE',
            'Very Loud': '#FF375F',
            Upright: '#FFCC00',
            UpsideDown: '#B775FF',
            Left: '#FF3B30',
            Right: '#0A84FF',
            'Face Up': '#30D158',
            'Face Down': '#BF5AF2',
            Flat: '#8E8E93',
        };
        return colors[label] || '#999';
    };

    const activityData = getSummaryData('activity');
    const lightData = getSummaryData('light');
    const noiseData = getSummaryData('noise');
    const orientationData = getSummaryData('orientation');

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.bg}>
                <ScrollView contentContainerStyle={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Activity History</Text>
                        <Pressable onPress={clearHistory} style={styles.clearBtn}>
                            <Ionicons name="trash" size={22} color="#fff" />
                        </Pressable>
                    </View>

                    <View style={styles.filterRow}>
                        <TouchableOpacity
                            style={[styles.filterBtn, filter === '24h' && styles.activeFilter]}
                            onPress={() => applyFilter(history, '24h')}
                        >
                            <Text style={[styles.filterText, filter === '24h' && styles.activeFilterText]}>
                                Last 24h
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.filterBtn, filter === '7d' && styles.activeFilter]}
                            onPress={() => applyFilter(history, '7d')}
                        >
                            <Text style={[styles.filterText, filter === '7d' && styles.activeFilterText]}>
                                Last 7d
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.subtitle}>Activity Types</Text>
                    <PieChart
                        data={activityData}
                        width={screenWidth}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        center={[0, 0]}
                        absolute={false} // ✅ Show % not raw count
                    />

                    <Text style={styles.subtitle}>Light Exposure</Text>
                    <PieChart
                        data={lightData}
                        width={screenWidth}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        center={[0, 0]}
                        absolute={false}
                    />

                    <Text style={styles.subtitle}>Noise Levels</Text>
                    <PieChart
                        data={noiseData}
                        width={screenWidth}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        center={[0, 0]}
                        absolute={false}
                    />

                    <Text style={styles.subtitle}>Device Orientation</Text>
                    <PieChart
                        data={orientationData}
                        width={screenWidth}
                        height={220}
                        chartConfig={chartConfig}
                        accessor="count"
                        backgroundColor="transparent"
                        paddingLeft="0"
                        center={[0, 0]}
                        absolute={false}
                    />
                </ScrollView>
            </LinearGradient>
        </SafeAreaView>
    );
}

const chartConfig = {
    backgroundGradientFrom: '#667eea',
    backgroundGradientTo: '#764ba2',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#121212' },
    bg: { flex: 1 },
    container: { padding: 20, alignItems: 'center' },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginTop: 30,
        marginBottom: 10,
    },
    clearBtn: {
        padding: 10,
        backgroundColor: 'rgba(255,107,107,0.3)',
        borderRadius: 10,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    filterBtn: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#fff',
    },
    activeFilter: {
        backgroundColor: '#fff',
    },
    filterText: {
        color: '#fff',
        fontWeight: '600',
    },
    activeFilterText: {
        color: '#3333cc',
    },
});
