import { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { getToken } from '../utils/storage';


export default function SplashScreen() {
  useEffect(() => {
    const checkSession = async () => {
      const token = await getToken();

      setTimeout(() => {
        if (token) {
          router.replace('/(app)');
        } else {
          router.replace('/login');
        }
      }, 2000);
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/poros-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>POROS</Text>

      <Text style={styles.subtitle}>
        Manajemen Proyek & Kolaborasi Tim
      </Text>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Mengatur pekerjaan lebih terarah
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 24,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#111827',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});