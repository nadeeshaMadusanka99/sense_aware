import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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
});