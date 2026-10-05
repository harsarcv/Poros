import { useState } from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { API_URL } from '../../constants/api';
import { getToken } from '../../utils/storage';

export default function SecurityScreen() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (
            !currentPassword ||
            !newPassword ||
            !confirmPassword
        ) {
            Alert.alert(
                'Perhatian',
                'Semua field password wajib diisi.'
            );
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert(
                'Perhatian',
                'Password baru minimal 6 karakter.'
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert(
                'Perhatian',
                'Konfirmasi password tidak sama.'
            );
            return;
        }

        if (currentPassword === newPassword) {
            Alert.alert(
                'Perhatian',
                'Password baru harus berbeda dari password saat ini.'
            );
            return;
        }

        try {
            setLoading(true);

            const token = await getToken();

            if (!token) {
                Alert.alert(
                    'Sesi Berakhir',
                    'Silakan login kembali.'
                );

                router.replace('/login');
                return;
            }

            const response = await fetch(
                `${API_URL}/api/users/me/password`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        currentPassword,
                        newPassword,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal mengubah password.'
                );
            }

            Alert.alert(
                'Berhasil',
                'Password berhasil diperbarui.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setCurrentPassword('');
                            setNewPassword('');
                            setConfirmPassword('');

                            router.back();
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error(
                'CHANGE PASSWORD ERROR:',
                error
            );

            Alert.alert(
                'Gagal',
                error.message ||
                'Terjadi kesalahan saat mengubah password.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['top']}
        >
            {/* =========================
                HEADER
            ========================= */}

            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.replace('/profile')}
                >
                    <Text style={styles.backText}>
                        ‹
                    </Text>
                </Pressable>

                <Text style={styles.title}>
                    Keamanan
                </Text>
            </View>

            {/* =========================
                CONTENT
            ========================= */}

            <View style={styles.content}>

                

                {/* TITLE */}

                <Text style={styles.heading}>
                    Ganti Password
                </Text>

                <Text style={styles.description}>
                    Gunakan password yang kuat untuk menjaga
                    keamanan akun POROS kamu.
                </Text>

                {/* =========================
                    FORM
                ========================= */}

                <View style={styles.form}>

                    {/* PASSWORD SAAT INI */}

                    <Text style={styles.label}>
                        Password Saat Ini
                    </Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                            placeholder="Masukkan password saat ini"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={!showCurrent}
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Pressable
                            onPress={() =>
                                setShowCurrent(!showCurrent)
                            }
                        >
                            <Text style={styles.showText}>
                                {showCurrent
                                    ? 'Sembunyikan'
                                    : 'Lihat'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* PASSWORD BARU */}

                    <Text style={styles.label}>
                        Password Baru
                    </Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Masukkan password baru"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={!showNew}
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Pressable
                            onPress={() =>
                                setShowNew(!showNew)
                            }
                        >
                            <Text style={styles.showText}>
                                {showNew
                                    ? 'Sembunyikan'
                                    : 'Lihat'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* KONFIRMASI PASSWORD */}

                    <Text style={styles.label}>
                        Konfirmasi Password Baru
                    </Text>

                    <View style={styles.inputWrapper}>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={
                                setConfirmPassword
                            }
                            placeholder="Ulangi password baru"
                            placeholderTextColor="#94A3B8"
                            secureTextEntry={
                                !showConfirm
                            }
                            style={styles.input}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <Pressable
                            onPress={() =>
                                setShowConfirm(
                                    !showConfirm
                                )
                            }
                        >
                            <Text style={styles.showText}>
                                {showConfirm
                                    ? 'Sembunyikan'
                                    : 'Lihat'}
                            </Text>
                        </Pressable>
                    </View>

                    {/* HELPER */}

                    <Text style={styles.helper}>
                        Password minimal 6 karakter.
                    </Text>

                    {/* BUTTON */}

                    <Pressable
                        style={[
                            styles.button,
                            loading &&
                                styles.buttonDisabled,
                        ]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading
                                ? 'Menyimpan...'
                                : 'Simpan Perubahan'}
                        </Text>
                    </Pressable>

                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({

    /* =========================
       CONTAINER
    ========================= */

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    /* =========================
       HEADER
    ========================= */

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },

    backButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    backText: {
        fontSize: 28,
        lineHeight: 30,
        color: '#0F172A',
        fontWeight: '300',
    },

    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
    },

    /* =========================
       CONTENT
    ========================= */

    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 28,
    },

    /* =========================
       ICON
    ========================= */

    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    lockIcon: {
        fontSize: 27,
    },

    /* =========================
       TITLE
    ========================= */

    heading: {
        fontSize: 24,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },

    description: {
        marginTop: 8,
        fontSize: 14,
        lineHeight: 21,
        color: '#64748B',
        textAlign: 'center',
        paddingHorizontal: 8,
    },

    /* =========================
       FORM
    ========================= */

    form: {
        marginTop: 28,
    },

    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#334155',
        marginBottom: 8,
    },

    inputWrapper: {
        minHeight: 52,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CBD5E1',
        borderRadius: 14,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 14,
        marginBottom: 18,
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: '#0F172A',
        paddingVertical: 0,
    },

    showText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },

    helper: {
        fontSize: 12,
        color: '#64748B',
        marginTop: -6,
        marginBottom: 20,
    },

    /* =========================
       BUTTON
    ========================= */

    button: {
        height: 52,
        borderRadius: 14,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonDisabled: {
        opacity: 0.55,
    },

    buttonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
});