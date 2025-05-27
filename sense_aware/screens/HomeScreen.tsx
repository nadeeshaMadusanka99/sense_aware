import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Image, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import SensorService from '../services/SensorService';
import TTSService from '../services/TTSService';
import NotificationService from '../services/NotificationService';
import { SensorData } from '../types';

const SITTING_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

export default function HomeScreen() {
    const [data, setData] = useState<SensorData>({ activity: 'Unknown', light: 'Normal', orientation: 'Upright', timestamp: '' });
    const [walkTime, setWalkTime] = useState<number>(0);
    const lastWalkStart = useRef<number | null>(null);
    const lastSitTime = useRef<number | null>(null);
    const [sitWarningSent, setSitWarningSent] = useState<boolean>(false);

    useEffect(() => {
        SensorService.subscribe((result: SensorData) => {
            setData(result);
            NotificationService.handleCondition(result);

            const now = Date.now();

            if (result.activity === 'Sitting') {
                if (!lastSitTime.current) {
                    lastSitTime.current = now;
                    setSitWarningSent(false);
                } else if (!sitWarningSent && now - lastSitTime.current > SITTING_THRESHOLD_MS) {
                    NotificationService.handleCondition({
                        activity: 'Sitting',
                        light: data.light,
                        orientation: data.orientation,
                        timestamp: new Date().toLocaleString()
                    });
                    setSitWarningSent(true);
                }
                lastWalkStart.current = null;
            } else if (result.activity === 'Walking' || result.activity === 'Running') {
                if (!lastWalkStart.current) {
                    lastWalkStart.current = now;
                } else {
                    const duration = now - lastWalkStart.current;
                    setWalkTime(prev => prev + duration);
                    lastWalkStart.current = now;
                }
                lastSitTime.current = null;
            } else {
                lastSitTime.current = null;
                lastWalkStart.current = null;
            }
        });

        return () => SensorService.unsubscribe();
    }, []);

    const handleSpeak = () => {
        TTSService.speak(data);
    };

    const formatMinutes = (ms: number) => Math.floor(ms / 60000);

    return (
        <SafeAreaView style={styles.safeArea}>
            <LinearGradient colors={["#1E3C72", "#2A5298"]} style={styles.background}>
                <View style={styles.container}>
                    <Image source={require('../assets/senseaware-logo.png')} style={styles.logo} />

                    <View style={styles.panelRow}>
                        <View style={styles.panel}>
                            <Text style={styles.panelIcon}>🏃</Text>
                            <Text style={styles.panelLabel}>{data.activity}</Text>
                        </View>
                        <View style={styles.panel}>
                            <Text style={styles.panelIcon}>💡</Text>
                            <Text style={styles.panelLabel}>{data.light}</Text>
                        </View>
                        <View style={styles.panel}>
                            <Text style={styles.panelIcon}>🔄</Text>
                            <Text style={styles.panelLabel}>{data.orientation}</Text>
                        </View>
                    </View>

                    <View style={styles.statsContainer}>
                        <Text style={styles.statsLabel}>Walk Time</Text>
                        <Text style={styles.statsValue}>{formatMinutes(walkTime)} min</Text>
                    </View>

                    <Pressable style={styles.speakButton} onPress={handleSpeak}>
                        <Text style={styles.speakText}>🔊</Text>
                    </Pressable>
                </View>
            </LinearGradient>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '90%',
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 40,
        resizeMode: 'contain',
    },
    panelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 30,
    },
    panel: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.15)',
        marginHorizontal: 5,
        paddingVertical: 30,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 5,
    },
    panelIcon: {
        fontSize: 36,
        color: '#fff',
        marginBottom: 10,
    },
    panelLabel: {
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    statsContainer: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 30,
    },
    statsLabel: {
        fontSize: 16,
        color: '#fff',
        marginBottom: 6,
    },
    statsValue: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
    },
    speakButton: {
        backgroundColor: '#FF6B6B',
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF6B6B',
        shadowOpacity: 0.6,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
        elevation: 10,
    },
    speakText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
});
