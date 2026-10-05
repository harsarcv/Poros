import { useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { saveSession } from '../utils/storage';
import { API_URL } from '../constants/api';
import { ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setError('');

        const emailTrim = email.trim().toLowerCase();

        if (!emailTrim || !password) {
            setError('Email dan kata sandi wajib diisi.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailTrim)) {
            setError('Format email tidak valid.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailTrim,
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Email atau kata sandi salah.');
                return;
            }

            await saveSession(data.token, data.user);

            router.replace('/(app)');
        } catch (error) {
            console.error('LOGIN ERROR:', error);
            setError('Tidak dapat terhubung ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.content}>

                <Text style={styles.title}>Selamat Datang</Text>

                <Text style={styles.subtitle}>
                    Masuk ke akun Poros untuk melanjutkan pekerjaanmu.
                </Text>

                <View style={styles.form}>
                    <View>
                        <Text style={styles.label}>Email</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan email"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={{ position: 'relative' }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Masukkan kata sandi"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                        />

                        <Pressable
                            onPress={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: 16,
                                top: 0,
                                height: 52,
                                justifyContent: 'center',
                            }}
                        >
                            <Ionicons
                                name={
                                    showPassword
                                        ? 'eye-off-outline'
                                        : 'eye-outline'
                                }
                                size={21}
                                color="#64748B"
                            />
                        </Pressable>
                    </View>

                    {error ? (
                        <Text style={styles.errorText}>
                            {error}
                        </Text>
                    ) : null}

                    <Pressable
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text style={styles.buttonText}>Masuk</Text>
                        )}
                    </Pressable>
                </View>

                <View style={styles.registerContainer}>
                    <Text style={styles.registerText}>
                        Belum memiliki akun?
                    </Text>

                    <Pressable onPress={() => router.push('/register')}>
                        <Text style={styles.registerLink}> Daftar</Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },

    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },

    logoContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 28,
    },

logo: {
    width: 72,
    height: 72,
    marginBottom: 28,
},

    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#111827',
    },

    subtitle: {
        marginTop: 10,
        fontSize: 15,
        lineHeight: 22,
        color: '#6B7280',
    },

    form: {
        marginTop: 32,
        gap: 20,
    },

    label: {
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#FFFFFF',
    },

    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#111827',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 28,
    },

    registerText: {
        fontSize: 14,
        color: '#6B7280',
    },

    registerLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },
    errorText: {
        marginTop: 4,
        fontSize: 13,
        color: '#DC2626',
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    passwordContainer: {
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        paddingLeft: 14,
    },

    passwordInput: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
    },

    eyeButton: {
        width: 48,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
});