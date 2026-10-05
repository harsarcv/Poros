import { useCallback, useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';

import { API_URL } from '../../constants/api';
import { getToken } from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateProjectScreen() {
    const { id } = useLocalSearchParams();

    const isEditMode = Boolean(id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState('AKTIF');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ==========================================
    // LOAD DATA PROJECT
    // ==========================================

    useFocusEffect(
        useCallback(() => {
            const loadProject = async () => {
                try {
                    setLoading(true);
                    setError('');

                    const token = await getToken();

                    if (!token) {
                        setError(
                            'Sesi login tidak ditemukan. Silakan login kembali.'
                        );
                        return;
                    }

                    // ==========================================
                    // MODE EDIT
                    // ==========================================

                    if (isEditMode) {
                        const response = await fetch(
                            `${API_URL}/api/projects/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(
                                data.message ||
                                'Gagal mengambil data proyek.'
                            );
                        }

                        setName(data.name || '');
                        setDescription(
                            data.description || ''
                        );
                        setDeadline(
                            data.deadline
                                ? String(data.deadline).slice(0, 10)
                                : ''
                        );
                        setStatus(
                            data.status || 'AKTIF'
                        );

                        return;
                    }

                    // ==========================================
                    // MODE TAMBAH
                    // ==========================================

                    setName('');
                    setDescription('');
                    setDeadline('');
                    setStatus('AKTIF');
                } catch (error: any) {
                    console.error(
                        'LOAD PROJECT ERROR:',
                        error
                    );

                    setError(
                        error?.message ||
                        'Gagal mengambil data proyek.'
                    );
                } finally {
                    setLoading(false);
                }
            };

            loadProject();
        }, [id, isEditMode])
    );

    // ==========================================
    // SIMPAN PROJECT
    // ==========================================

    const handleSaveProject = async () => {
        setError('');

        const projectName = name.trim();
        const projectDeadline = deadline.trim();

        // ==========================================
        // VALIDASI NAMA
        // ==========================================

        if (!projectName) {
            setError('Nama proyek wajib diisi.');
            return;
        }

        if (projectName.length < 3) {
            setError(
                'Nama proyek minimal 3 karakter.'
            );
            return;
        }

        // ==========================================
        // VALIDASI DEADLINE
        // ==========================================

        if (projectDeadline) {
            const dateRegex =
                /^\d{4}-\d{2}-\d{2}$/;

            if (!dateRegex.test(projectDeadline)) {
                setError(
                    'Format deadline harus YYYY-MM-DD.'
                );
                return;
            }

            const date = new Date(
                `${projectDeadline}T00:00:00`
            );

            if (Number.isNaN(date.getTime())) {
                setError(
                    'Tanggal deadline tidak valid.'
                );
                return;
            }
        }

        try {
            setLoading(true);

            const token = await getToken();

            if (!token) {
                setError(
                    'Sesi login tidak ditemukan. Silakan login kembali.'
                );
                return;
            }

            // ==========================================
            // URL + METHOD
            // ==========================================

            const url = isEditMode
                ? `${API_URL}/api/projects/${id}`
                : `${API_URL}/api/projects`;

            const response = await fetch(url, {
                method: isEditMode ? 'PUT' : 'POST',

                headers: {
                    'Content-Type':
                        'application/json',
                    Authorization: `Bearer ${token}`,
                },

                body: JSON.stringify({
                    name: projectName,
                    description:
                        description.trim(),
                    deadline:
                        projectDeadline || null,
                    status,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.message ||
                    (isEditMode
                        ? 'Gagal memperbarui proyek.'
                        : 'Gagal membuat proyek.')
                );

                return;
            }

            // ==========================================
            // BERHASIL
            // ==========================================

            alert(
                isEditMode
                    ? 'Proyek berhasil diperbarui.'
                    : 'Proyek berhasil dibuat.'
            );

            // ==========================================
            // REDIRECT
            // ==========================================

            if (isEditMode) {
                router.replace({
                    pathname:
                        '/(app)/project-detail',
                    params: {
                        id: String(id),
                    },
                });
            } else {
                router.replace(
                    '/(app)/projects'
                );
            }
        } catch (error) {
            console.error(
                'SAVE PROJECT ERROR:',
                error
            );

            setError(
                'Tidak dapat terhubung ke server.'
            );
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // UI
    // ==========================================

    return (
        <SafeAreaView
            style={styles.container}
            edges={['bottom']}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.replace('/(app)/projects')}
                    >
                        <Text style={styles.back}>
                            ‹
                        </Text>
                    </Pressable>

                    <View>
                        <Text style={styles.title}>
                            {isEditMode
                                ? 'Edit Proyek'
                                : 'Buat Proyek'}
                        </Text>

                        <Text
                            style={styles.subtitle}
                        >
                            {isEditMode
                                ? 'Perbarui informasi proyek.'
                                : 'Tambahkan proyek baru ke POROS.'}
                        </Text>
                    </View>
                </View>

                {/* FORM */}

                <View style={styles.form}>
                    {/* NAMA */}

                    <Text style={styles.label}>
                        Nama Proyek
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: Website Perusahaan"
                        placeholderTextColor="#94A3B8"
                        value={name}
                        onChangeText={setName}
                    />

                    {/* DESKRIPSI */}

                    <Text style={styles.label}>
                        Deskripsi
                    </Text>

                    <TextInput
                        style={[
                            styles.input,
                            styles.textArea,
                        ]}
                        placeholder="Masukkan deskripsi proyek"
                        placeholderTextColor="#94A3B8"
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {/* DEADLINE */}

                    <Text style={styles.label}>
                        Deadline
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder="Contoh: 2026-10-30"
                        placeholderTextColor="#94A3B8"
                        value={deadline}
                        onChangeText={setDeadline}
                    />

                    {/* STATUS */}

                    <Text style={styles.label}>
                        Status Proyek
                    </Text>

                    <View
                        style={
                            styles.statusContainer
                        }
                    >
                        {/* AKTIF */}

                        <Pressable
                            style={
                                status === 'AKTIF'
                                    ? styles.statusActive
                                    : styles.statusOption
                            }
                            onPress={() =>
                                setStatus('AKTIF')
                            }
                        >
                            <Text
                                style={
                                    status === 'AKTIF'
                                        ? styles.statusActiveText
                                        : styles.statusText
                                }
                            >
                                AKTIF
                            </Text>
                        </Pressable>

                        {/* SELESAI */}

                        <Pressable
                            style={
                                status === 'SELESAI'
                                    ? styles.statusActive
                                    : styles.statusOption
                            }
                            onPress={() =>
                                setStatus('SELESAI')
                            }
                        >
                            <Text
                                style={
                                    status === 'SELESAI'
                                        ? styles.statusActiveText
                                        : styles.statusText
                                }
                            >
                                SELESAI
                            </Text>
                        </Pressable>
                    </View>

                    {/* ERROR */}

                    {error ? (
                        <View
                            style={styles.errorBox}
                        >
                            <Text
                                style={styles.errorText}
                            >
                                {error}
                            </Text>
                        </View>
                    ) : null}

                    {/* SAVE BUTTON */}

                    <Pressable
                        style={[
                            styles.saveButton,
                            loading &&
                            styles.buttonDisabled,
                        ]}
                        onPress={
                            handleSaveProject
                        }
                        disabled={loading}
                    >
                        <Text
                            style={
                                styles.saveButtonText
                            }
                        >
                            {loading
                                ? 'Menyimpan...'
                                : isEditMode
                                    ? 'Simpan Perubahan'
                                    : 'Simpan Proyek'}
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    content: {
        padding: 24,
        paddingTop: 55,
        paddingBottom: 40,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        marginBottom: 30,
    },

    back: {
        fontSize: 36,
        color: '#111827',
        lineHeight: 36,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
    },

    subtitle: {
        marginTop: 4,
        fontSize: 13,
        color: '#64748B',
    },

    form: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 8,
        marginTop: 4,
    },

    input: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 13,
        color: '#0F172A',
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
    },

    textArea: {
        height: 110,
        paddingTop: 14,
    },

    statusContainer: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },

    statusActive: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#0F172A',
        alignItems: 'center',
    },

    statusActiveText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    statusOption: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },

    statusText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#64748B',
    },

    saveButton: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
    },

    buttonDisabled: {
        opacity: 0.6,
    },

    saveButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    errorBox: {
        backgroundColor: '#FEF2F2',
        borderWidth: 1,
        borderColor: '#FECACA',
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },

    errorText: {
        fontSize: 12,
        color: '#B91C1C',
        lineHeight: 18,
    },
});