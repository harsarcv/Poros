import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { getToken } from '../utils/storage';

export default function Index() {
    useEffect(() => {
        const checkSession = async () => {
            const token = await getToken();

            if (token) {
                router.replace('/(app)');
            } else {
                router.replace('/login');
            }
        };

        checkSession();
    }, []);

    return (
        <View style={styles.container} />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
});