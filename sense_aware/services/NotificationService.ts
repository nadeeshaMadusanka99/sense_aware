import * as Notifications from 'expo-notifications';
import { SensorData } from '../types';

const NotificationService = {
    async handleCondition({ light, activity }: SensorData) {
        if (light === 'Bright Light') {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Bright Light Alert',
                    body: 'Consider wearing sunglasses.',
                },
                trigger: null,
            });
        }
        if (activity === 'Sitting') {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Activity Alert',
                    body: 'Time to take a walk!',
                },
                trigger: null,
            });
        }
    }
};

export default NotificationService;