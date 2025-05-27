import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, Switch, SafeAreaView,
     Pressable
} from 'react-native';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import StorageService from '../services/StorageService';
import { Settings } from '../types';

export default function SettingsScreen() {
    const [settings, setSettings] = useState<Settings>({
        ttsEnabled: true,
        notificationsEnabled: true,
        migraineModeEnabled: false,
        sitThreshold: 15,
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const saved = await StorageService.getSettings();
        setSettings(saved);
    };

    const updateSetting = async (key: keyof Settings, value: any) => {
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        await StorageService.saveSettings(updated);
    };

    const SettingRow = ({
                            icon,
                            title,
                            subtitle,
                            children
                        }: {
        icon: keyof typeof Ionicons.glyphMap;
        title: string;
        subtitle?: string;
        children: React.ReactNode;
    }) => (
        <View style={styles.row}>
            <View style={styles.rowLeft}>
                <Ionicons name={icon} size={24} color="#fff" />
                <View style={styles.textContainer}>
                    <Text style={styles.rowTitle}>{title}</Text>
                    {subtitle && (
                        <Text style={styles.rowSubtitle}>{subtitle}</Text>
                    )}
                </View>
            </View>
            {children}
        </View>
    );

    return (
        <SafeAreaView style={styles.safe}>
            <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.bg}
            >
                <View style={styles.container}>
                    <Text style={styles.title}>Settings</Text>

                    <View style={styles.section}>
                        <SettingRow
                            icon="volume-high"
                            title="Text-to-Speech"
                            subtitle="Voice announcements"
                        >
                            <Switch
                                value={settings.ttsEnabled}
                                onValueChange={(v) => updateSetting('ttsEnabled', v)}
                                thumbColor="#fff"
                                trackColor={{ false: '#666', true: '#4CAF50' }}
                            />
                        </SettingRow>

                        <SettingRow
                            icon="notifications"
                            title="Notifications"
                            subtitle="Push notifications"
                        >
                            <Switch
                                value={settings.notificationsEnabled}
                                onValueChange={(v) => updateSetting('notificationsEnabled', v)}
                                thumbColor="#fff"
                                trackColor={{ false: '#666', true: '#4CAF50' }}
                            />
                        </SettingRow>

                        <SettingRow
                            icon="medical"
                            title="Migraine Mode"
                            subtitle="Enhanced sensitivity alerts"
                        >
                            <Switch
                                value={settings.migraineModeEnabled}
                                onValueChange={(v) => updateSetting('migraineModeEnabled', v)}
                                thumbColor="#fff"
                                trackColor={{ false: '#666', true: '#FF6B6B' }}
                            />
                        </SettingRow>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sitting Alert</Text>
                        <Text style={styles.sliderLabel}>
                            Alert after {settings.sitThreshold} minutes
                        </Text>
                        <Slider
                            style={styles.slider}
                            value={settings.sitThreshold}
                            onValueChange={(v) => updateSetting('sitThreshold', Math.round(v))}
                            minimumValue={5}
                            maximumValue={60}
                            step={5}
                            thumbTintColor="#FF6B6B"
                            minimumTrackTintColor="#FF6B6B"
                            maximumTrackTintColor="rgba(255,255,255,0.3)"
                        />
                    </View>
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
    // Settings Screen styles
    section: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 15,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    textContainer: {
        marginLeft: 15,
        flex: 1,
    },
    rowTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    rowSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
        marginTop: 2,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    sliderLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 10,
        textAlign: 'center',
    },
});