import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, SafeAreaView,
    Pressable, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import { SensorData } from '../types';

export default function HistoryScreen() {
    const [history, setHistory] = useState<SensorData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        const data = await StorageService.getHistory();
        setHistory(data);
        setLoading(false);
    };

    const clearHistory = () => {
        Alert.alert(
            'Clear History',
            'Are you sure you want to delete all history?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        await StorageService.clearHistory();
                        setHistory([]);
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: SensorData }) => (
        <View style={styles.item}>
            <View style={styles.itemRow}>
                <Text style={styles.activity}>{item.activity}</Text>
                <Text style={styles.time}>
                    {item.timestamp.split(' ')[1]}
                </Text>
            </View>
            <View style={styles.details}>
                <Text style={styles.detail}>💡 {item.light}</Text>
                <Text style={styles.detail}>🔊 {item.noise}</Text>
                <Text style={styles.detail}>📱 {item.orientation}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.bg}
            >
                <View style={styles.container}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Activity History</Text>
                        <Pressable onPress={clearHistory} style={styles.clearBtn}>
                            <Ionicons name="trash" size={20} color="#fff" />
                        </Pressable>
                    </View>

                    {loading ? (
                        <Text style={styles.loading}>Loading...</Text>
                    ) : history.length === 0 ? (
                        <Text style={styles.empty}>No activity recorded yet</Text>
                    ) : (
                        <FlatList
                            data={history}
                            renderItem={renderItem}
                            keyExtractor={(_, index) => index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.list}
                        />
                    )}
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1 },
    bg: { flex: 1 },
    container: { flex: 1, padding: 20 },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    header: { alignItems: 'center', marginBottom: 30 },
    // History Screen styles
    clearBtn: {
        padding: 10,
        backgroundColor: 'rgba(255,107,107,0.3)',
        borderRadius: 10,
    },
    loading: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        marginTop: 50,
    },
    empty: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16,
        marginTop: 50,
    },
    list: { paddingBottom: 20 },
    item: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activity: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    time: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detail: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
    },
});