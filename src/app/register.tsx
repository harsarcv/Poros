import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../constants/api';

export default function RegisterScreen() {
    const [nama, setNama] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setError('');

        const namaTrim = nama.trim();
        const emailTrim = email.trim();

        if (!namaTrim || !emailTrim || !password || !konfirmasiPassword) {
            setError('Semua field wajib diisi.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailTrim)) {
            setError('Format email tidak valid.');
            return;
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter.');
            return;
        }

        if (password !== konfirmasiPassword) {
            setError('Konfirmasi password tidak sama.');
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: namaTrim,
                    email: emailTrim,
                    password,
                    role: 'MEMBER',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Registrasi gagal.');
                return;
            }

            Alert.alert(
                'Registrasi Berhasil',
                'Akun berhasil dibuat. Silakan login.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.replace('/login'),
                    },
                ]
            );
        } catch (error) {
            console.error('REGISTER ERROR:', error);
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
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Buat Akun</Text>
                    <Text style={styles.subtitle}>
                        Daftar untuk mulai menggunakan POROS
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Nama</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Masukkan nama"
                        placeholderTextColor="#9CA3AF"
                        value={nama}
                        onChangeText={setNama}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Email</Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Masukkan email"
                        placeholderTextColor="#9CA3AF"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Kata Sandi</Text>

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
                            onPress={() =>
                                setShowPassword(!showPassword)
                            }
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

                    <Text style={styles.label}>
                        Konfirmasi Kata Sandi
                    </Text>

                    <View style={{ position: 'relative' }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Ulangi kata sandi"
                            placeholderTextColor="#9CA3AF"
                            value={konfirmasiPassword}
                            onChangeText={setKonfirmasiPassword}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                        />

                        <Pressable
                            onPress={() =>
                                setShowConfirmPassword(
                                    !showConfirmPassword
                                )
                            }
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
                                    showConfirmPassword
                                        ? 'eye-off-outline'
                                        : 'eye-outline'
                                }
                                size={21}
                                color="#64748B"
                            />
                        </Pressable>
                    </View>

                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    <Pressable
                        style={[
                            styles.button,
                            loading && styles.buttonDisabled,
                        ]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Mendaftarkan...' : 'Daftar'}
                        </Text>
                    </Pressable>

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>
                            Sudah punya akun?
                        </Text>

                        <Pressable
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.loginLink}>
                                Masuk
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingVertical: 40,
        justifyContent: 'center',
    },

    header: {
        marginBottom: 32,
    },

    title: {
        fontSize: 30,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
    },

    subtitle: {
        fontSize: 15,
        color: '#64748B',
        lineHeight: 22,
    },

    form: {
        width: '100%',
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
        marginTop: 16,
    },

    input: {
        height: 52,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        fontSize: 15,
        color: '#0F172A',
    },

    errorText: {
        color: '#DC2626',
        fontSize: 13,
        marginTop: 12,
        lineHeight: 19,
    },

    button: {
        height: 52,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },

    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },

    loginText: {
        fontSize: 14,
        color: '#64748B',
    },

    loginLink: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        marginLeft: 5,
    },
});