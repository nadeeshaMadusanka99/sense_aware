import * as Notifications from 'expo-notifications';
import { SensorData } from '../types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const NotificationService = {
    async init() {
        const { status } = await Notifications
            .requestPermissionsAsync();
        return status === 'granted';
    },

    async handleCondition(data: SensorData, isMigraineModeOn: boolean) {
        if (!isMigraineModeOn) return;

        const alerts = [];

        if (data.light === 'Bright') {
            alerts.push({
                title: '☀️ Bright Light Alert',
                body: 'Consider wearing sunglasses or moving to shade.',
            });
        }

        if (data.noise === 'Very Loud') {
            alerts.push({
                title: '🔊 Loud Noise Alert',
                body: 'Consider using earplugs or moving away.',
            });
        }

        for (const alert of alerts) {
            await this.send(alert.title, alert.body);
        }
    },

    async send(title: string, body: string) {
        await Notifications.scheduleNotificationAsync({
            content: { title, body },
            trigger: null,
        });
    },
};

export default NotificationService;