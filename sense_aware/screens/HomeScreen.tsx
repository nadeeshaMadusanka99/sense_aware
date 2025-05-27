import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, Pressable, SafeAreaView,
    Animated, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SensorService from '../services/SensorService';
import TTSService from '../services/TTSService';
import NotificationService from '../services/NotificationService';
import StorageService from '../services/StorageService';
import { SensorData, Settings } from '../types';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [data, setData] = useState<SensorData>({
        activity: 'Unknown',
        light: 'Normal',
        noise: 'Quiet',
        orientation: 'Upright',
        timestamp: '',
    });

    const [settings, setSettings] = useState<Settings>({
        ttsEnabled: true,
        notificationsEnabled: true,
        migraineModeEnabled: false,
        sitThreshold: 15,
    });

    const [walkTime, setWalkTime] = useState(0);
    const [sitTime, setSitTime] = useState(0);
    const lastActivity = useRef<string>('');
    const activityStartTime = useRef<number>(Date.now());
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadSettings();
        NotificationService.init();

        // Pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        SensorService.subscribe(handleSensorData);
        return () => SensorService.unsubscribe();
    }, []);

    const loadSettings = async () => {
        const saved = await StorageService.getSettings();
        setSettings(saved);
    };

    const handleSensorData = (result: SensorData) => {
        setData(result);

        if (settings.notificationsEnabled) {
            NotificationService.handleCondition(
                result,
                settings.migraineModeEnabled
            );
        }

        trackActivityTime(result.activity);
    };

    const trackActivityTime = (activity: string) => {
        const now = Date.now();

        if (lastActivity.current !== activity) {
            const duration = now - activityStartTime.current;

            if (lastActivity.current === 'Walking' ||
                lastActivity.current === 'Running') {
                setWalkTime(prev => prev + duration);
            } else if (lastActivity.current === 'Sitting') {
                setSitTime(prev => prev + duration);

                if (duration > settings.sitThreshold * 60 * 1000) {
                    NotificationService.send(
                        '⏰ Time to Move!',
                        'You\'ve been sitting for a while. Take a break!'
                    );
                }
            }

            lastActivity.current = activity;
            activityStartTime.current = now;
        }
    };

    const handleSpeak = () => {
        if (settings.ttsEnabled) {
            TTSService.speak(data);
        }
    };

    const getActivityIcon = (activity: string): keyof typeof Ionicons.glyphMap => {
        const icons: { [key: string]: keyof typeof Ionicons.glyphMap } = {
            Walking: 'walk',
            Running: 'fitness',
            Sitting: 'bed',
            Standing: 'person',
            Vehicle: 'car',
        };
        return icons[activity] ?? 'help';
    };

    const getActivityColor = (activity: string): string => {
        const colors: { [key: string]: string } = {
            Walking: '#4CAF50',
            Running: '#FF5722',
            Sitting: '#9C27B0',
            Standing: '#2196F3',
            Vehicle: '#FF9800',
        };
        return colors[activity] || '#666';
    };

    const formatTime = (ms: number) => {
        const mins = Math.floor(ms / 60000);
        return `${mins}m`;
    };

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.bg}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>SenseAware</Text>
                        <Text style={styles.subtitle}>Smart Activity Monitor</Text>
                    </View>

                    {/* Main Activity Card */}
                    <Animated.View
                        style={[
                            styles.mainCard,
                            { transform: [{ scale: pulseAnim }] }
                        ]}
                    >
                        <View style={[
                            styles.activityIcon,
                            { backgroundColor: getActivityColor(data.activity) }
                        ]}>
                            <Ionicons
                                name={getActivityIcon(data.activity)}
                                size={40}
                                color="#fff"
                            />
                        </View>
                        <Text style={styles.activityText}>{data.activity}</Text>
                        <Text style={styles.timestamp}>
                            {data.timestamp.split(' ')[1] || 'Now'}
                        </Text>
                    </Animated.View>

                    {/* Environment Cards */}
                    <View style={styles.envRow}>
                        <View style={styles.envCard}>
                            <Ionicons name="sunny" size={24} color="#FFD700" />
                            <Text style={styles.envLabel}>Light</Text>
                            <Text style={styles.envValue}>{data.light}</Text>
                        </View>

                        <View style={styles.envCard}>
                            <Ionicons name="volume-high" size={24} color="#FF6B6B" />
                            <Text style={styles.envLabel}>Sound</Text>
                            <Text style={styles.envValue}>{data.noise}</Text>
                        </View>

                        <View style={styles.envCard}>
                            <Ionicons name="phone-portrait" size={24} color="#4ECDC4" />
                            <Text style={styles.envLabel}>Position</Text>
                            <Text style={styles.envValue}>{data.orientation}</Text>
                        </View>
                    </View>

                    {/* Stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{formatTime(walkTime)}</Text>
                            <Text style={styles.statLabel}>Active Time</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{formatTime(sitTime)}</Text>
                            <Text style={styles.statLabel}>Rest Time</Text>
                        </View>
                    </View>

                    {/* TTS Button */}
                    <Pressable
                        style={[
                            styles.ttsBtn,
                            { opacity: settings.ttsEnabled ? 1 : 0.5 }
                        ]}
                        onPress={handleSpeak}
                    >
                        <Ionicons name="volume-high" size={28} color="#fff" />
                    </Pressable>
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
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    mainCard: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 25,
        padding: 30,
        alignItems: 'center',
        marginBottom: 25,
    },
    activityIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    activityText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    timestamp: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    envRow: {
        flexDirection: 'row',
        marginBottom: 25,
        justifyContent: 'space-between',
    },
    envCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    envLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 5,
    },
    envValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
        marginTop: 2,
    },
    statsRow: {
        flexDirection: 'row',
        marginBottom: 30,
        justifyContent: 'space-between',
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 5,
    },
    ttsBtn: {
        backgroundColor: '#FF6B6B',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
});