import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';

import { API_URL } from '../../constants/api';
import {
    getToken,
    getUser,
    saveSession,
} from '../../utils/storage';

export default function EditProfileScreen() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');
    const [profileImage, setProfileImage] =
        useState<string | null>(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadProfile();
        }, [])
    );

    // ==========================================
    // LOAD PROFILE
    // ==========================================

    const loadProfile = async () => {
        try {
            setLoading(true);

            const token = await getToken();

            if (!token) {
                router.replace('/login');
                return;
            }

            const response = await fetch(
                `${API_URL}/api/users/me`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal mengambil profil'
                );
            }

            setName(data.name || '');
            setEmail(data.email || '');
            setRole(data.role || '');

            setProfileImage(
                data.profile_image
                    ? `${API_URL}${data.profile_image}`
                    : null
            );
        } catch (error) {
            console.error(
                'LOAD EDIT PROFILE ERROR:',
                error
            );

            Alert.alert(
                'Gagal',
                'Gagal mengambil data profil.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // PILIH FOTO
    // ==========================================

    const handlePickImage = async () => {
        try {
            const permission =
                await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert(
                    'Izin diperlukan',
                    'POROS membutuhkan izin untuk mengakses galeri.'
                );

                return;
            }

            const result =
                await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ['images'],
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.8,
                });

            if (result.canceled) {
                return;
            }

            const selectedImage =
                result.assets[0];

            setProfileImage(
                selectedImage.uri
            );
        } catch (error) {
            console.error(
                'PICK IMAGE ERROR:',
                error
            );

            Alert.alert(
                'Gagal',
                'Gagal memilih foto.'
            );
        }
    };

    // ==========================================
    // SIMPAN
    // ==========================================

    const handleSave = async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            Alert.alert(
                'Validasi',
                'Nama tidak boleh kosong.'
            );
            return;
        }

        if (trimmedName.length < 3) {
            Alert.alert(
                'Validasi',
                'Nama minimal 3 karakter.'
            );
            return;
        }

        try {
            setSaving(true);

            const token = await getToken();

            if (!token) {
                router.replace('/login');
                return;
            }

            // ==========================================
            // 1. UPDATE NAMA
            // ==========================================

            const profileResponse = await fetch(
                `${API_URL}/api/users/me`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type':
                            'application/json',
                        Authorization:
                            `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: trimmedName,
                    }),
                }
            );

            const profileData =
                await profileResponse.json();

            if (!profileResponse.ok) {
                throw new Error(
                    profileData.message ||
                    'Gagal memperbarui profil'
                );
            }

            // ==========================================
            // 2. UPLOAD FOTO JIKA ADA
            // ==========================================

            let updatedUser =
                profileData.user;

            if (
                profileImage &&
                profileImage.startsWith('file://')
            ) {
                const formData = new FormData();

                const imageFile = new File(profileImage);

                formData.append('profile_image', imageFile);

                const photoResponse =
                    await fetch(
                        `${API_URL}/api/users/me/photo`,
                        {
                            method: 'PUT',
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                            body: formData,
                        }
                    );

                const photoData =
                    await photoResponse.json();

                if (!photoResponse.ok) {
                    throw new Error(
                        photoData.message ||
                        'Gagal mengupload foto'
                    );
                }

                updatedUser =
                    photoData.user;
            }

            // ==========================================
            // 3. UPDATE SESSION
            // ==========================================

            const currentUser =
                await getUser();

            if (currentUser) {
                await saveSession(
                    token,
                    {
                        ...currentUser,
                        ...updatedUser,
                    }
                );
            }

            // ==========================================
            // 4. SELESAI
            // ==========================================

            Alert.alert(
                'Berhasil',
                'Profil berhasil diperbarui.',
                [
                    {
                        text: 'OK',
                        onPress: () =>
                            router.replace('/profile'),
                    },
                ]
            );
        } catch (error: any) {
            console.error(
                'SAVE PROFILE ERROR:',
                error
            );

            Alert.alert(
                'Gagal',
                error.message ||
                'Gagal memperbarui profil.'
            );
        } finally {
            setSaving(false);
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />

                <Text style={styles.loadingText}>
                    Memuat profil...
                </Text>
            </View>
        );
    }

    // ==========================================
    // UI
    // ==========================================

    return (
        <View style={styles.container}>

            {/* HEADER */}

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
                    Edit Profil
                </Text>
            </View>

            {/* CONTENT */}

            <View style={styles.content}>

                {/* FOTO PROFIL */}

                <View style={styles.photoSection}>
                    <Pressable
                        style={styles.avatar}
                        onPress={handlePickImage}
                    >
                        {profileImage ? (
                            <Image
                                source={{
                                    uri: profileImage,
                                }}
                                style={styles.avatarImage}
                            />
                        ) : (
                            <Text style={styles.avatarText}>
                                {name
                                    ?.charAt(0)
                                    ?.toUpperCase() || '?'}
                            </Text>
                        )}
                    </Pressable>

                    <Pressable
                        onPress={handlePickImage}
                    >
                        <Text style={styles.changePhoto}>
                            Ubah Foto Profil
                        </Text>
                    </Pressable>

                    <Text style={styles.photoHint}>
                        Pilih foto berbentuk persegi
                    </Text>
                </View>

                {/* FORM */}

                <View style={styles.form}>

                    <Text style={styles.label}>
                        Nama
                    </Text>

                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Masukkan nama"
                        placeholderTextColor="#94A3B8"
                        style={styles.input}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>
                        Email
                    </Text>

                    <TextInput
                        value={email}
                        editable={false}
                        style={[
                            styles.input,
                            styles.inputDisabled,
                        ]}
                    />

                    <Text style={styles.helper}>
                        Email tidak dapat diubah.
                    </Text>

                    <Text style={styles.label}>
                        Role
                    </Text>

                    <View style={styles.roleInput}>
                        <Text style={styles.roleText}>
                            {role || 'MEMBER'}
                        </Text>
                    </View>

                </View>

                {/* SAVE */}

                <Pressable
                    style={[
                        styles.saveButton,
                        saving &&
                        styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#FFFFFF" />
                    ) : (
                        <Text style={styles.saveText}>
                            Simpan Perubahan
                        </Text>
                    )}
                </Pressable>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },

    loadingText: {
        marginTop: 10,
        fontSize: 13,
        color: '#64748B',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 18,
    },

    backButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
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
        marginTop: -3,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
    },

    content: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    photoSection: {
        alignItems: 'center',
        marginTop: 10,
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    avatarImage: {
        width: '100%',
        height: '100%',
    },

    avatarText: {
        fontSize: 36,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    changePhoto: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },

    photoHint: {
        marginTop: 4,
        fontSize: 11,
        color: '#94A3B8',
    },

    form: {
        marginTop: 30,
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 8,
        marginTop: 18,
    },

    input: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 13,
        color: '#0F172A',
    },

    inputDisabled: {
        backgroundColor: '#F1F5F9',
        color: '#64748B',
    },

    helper: {
        marginTop: 5,
        fontSize: 10,
        color: '#94A3B8',
    },

    roleInput: {
        height: 48,
        backgroundColor: '#F1F5F9',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingHorizontal: 14,
        justifyContent: 'center',
    },

    roleText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },

    saveButton: {
        height: 50,
        borderRadius: 12,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
    },

    saveButtonDisabled: {
        opacity: 0.6,
    },

    saveText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});