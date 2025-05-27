import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
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