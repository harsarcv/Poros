import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { useCallback, useEffect, useState } from 'react';
import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';

import { API_URL } from '../../constants/api';
import { getToken } from '../../utils/storage';

export default function CreateTaskScreen() {
    const { id, projectId, projectName } = useLocalSearchParams();

    // Kalau ada id berarti MODE EDIT
    const isEditMode = !!id;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');

    const [members, setMembers] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);

    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(
        null
    );
    const [selectedMember, setSelectedMember] = useState('Pilih anggota');

    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
        null
    );
    const [selectedProjectName, setSelectedProjectName] =
        useState('Pilih proyek');

    const [selectedPriority, setSelectedPriority] = useState('Sedang');
    const [selectedStatus, setSelectedStatus] = useState('TODO');

    const [memberModalVisible, setMemberModalVisible] = useState(false);
    const [projectModalVisible, setProjectModalVisible] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // =========================================================
    // AMBIL PROJECT + MEMBER
    // =========================================================

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const token = await getToken();

                const headers = {
                    Authorization: `Bearer ${token}`,
                };

                // =========================
                // PROJECT
                // =========================

                const projectResponse = await fetch(
                    `${API_URL}/api/projects`,
                    {
                        headers,
                    }
                );

                const projectData = await projectResponse.json();

                if (!projectResponse.ok) {
                    throw new Error(
                        projectData.message || 'Gagal mengambil proyek'
                    );
                }

                setProjects(projectData);

                // Kalau dari Detail Proyek
                if (projectId && !isEditMode) {
                    const project = projectData.find(
                        (item: any) =>
                            String(item.id) === String(projectId)
                    );

                    if (project) {
                        setSelectedProjectId(project.id);
                        setSelectedProjectName(project.name);
                    }
                }

                // =========================
                // MEMBER
                // =========================

                const memberResponse = await fetch(
                    `${API_URL}/api/users`,
                    {
                        headers,
                    }
                );

                const memberData = await memberResponse.json();

                if (!memberResponse.ok) {
                    throw new Error(
                        memberData.message ||
                        'Gagal mengambil data anggota'
                    );
                }

                setMembers(memberData);
            } catch (error) {
                console.error('FETCH INITIAL DATA ERROR:', error);

                Alert.alert(
                    'Gagal',
                    error instanceof Error
                        ? error.message
                        : 'Gagal mengambil data'
                );
            }
        };

        fetchInitialData();
    }, [projectId, isEditMode]);

    // =========================================================
    // AMBIL DATA TASK SAAT MODE EDIT
    // =========================================================

    useFocusEffect(
        useCallback(() => {
            if (!isEditMode || !id) {
                setLoading(false);
                return;
            }

            const fetchTask = async () => {
                try {
                    setLoading(true);

                    const token = await getToken();

                    const response = await fetch(
                        `${API_URL}/api/tasks/${id}`,
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
                            'Gagal mengambil detail tugas'
                        );
                    }

                    // =========================
                    // ISI FORM
                    // =========================

                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setDeadline(
                        data.deadline
                            ? String(data.deadline).split('T')[0]
                            : ''
                    );

                    setSelectedStatus(data.status || 'TODO');

                    const priorityMap: Record<string, string> = {
                        RENDAH: 'Rendah',
                        SEDANG: 'Sedang',
                        TINGGI: 'Tinggi',
                    };

                    setSelectedPriority(
                        priorityMap[data.priority] || 'Sedang'
                    );

                    if (data.assigned_to) {
                        setSelectedMemberId(data.assigned_to);
                        setSelectedMember(
                            data.assigned_name || 'Pilih anggota'
                        );
                    }

                    if (data.project_id) {
                        setSelectedProjectId(data.project_id);
                        setSelectedProjectName(
                            data.project_name || 'Pilih proyek'
                        );
                    }
                } catch (error) {
                    console.error('FETCH TASK ERROR:', error);

                    Alert.alert(
                        'Gagal',
                        error instanceof Error
                            ? error.message
                            : 'Gagal mengambil data tugas'
                    );
                } finally {
                    setLoading(false);
                }
            };

            fetchTask();
        }, [id, isEditMode])
    );

    // =========================================================
    // RESET FORM UNTUK MODE CREATE
    // =========================================================

    useFocusEffect(
        useCallback(() => {
            if (isEditMode) return;

            setTitle('');
            setDescription('');
            setDeadline('');

            setSelectedMember('Pilih anggota');
            setSelectedMemberId(null);

            setSelectedPriority('Sedang');
            setSelectedStatus('TODO');

            setMemberModalVisible(false);
            setProjectModalVisible(false);

            setLoading(false);
        }, [isEditMode])
    );

    // =========================================================
    // CREATE / UPDATE TASK
    // =========================================================

    const handleSubmit = async () => {
        if (!title.trim()) {
            Alert.alert(
                'Peringatan',
                'Nama tugas wajib diisi'
            );
            return;
        }

        if (!selectedProjectId) {
            Alert.alert(
                'Peringatan',
                'Silakan pilih proyek'
            );
            return;
        }

        try {
            setSaving(true);

            const token = await getToken();

            const priorityMap: Record<string, string> = {
                Rendah: 'RENDAH',
                Sedang: 'SEDANG',
                Tinggi: 'TINGGI',
            };

            const body = {
                title: title.trim(),
                description: description.trim() || null,
                assigned_to: selectedMemberId,
                priority: priorityMap[selectedPriority],
                status: selectedStatus,
                deadline: deadline.trim() || null,
            };

            // =================================================
            // EDIT
            // =================================================

            if (isEditMode) {
                const response = await fetch(
                    `${API_URL}/api/tasks/${id}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify(body),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                        'Gagal memperbarui tugas'
                    );
                }

                Alert.alert(
                    'Berhasil',
                    'Tugas berhasil diperbarui',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                router.replace({
                                    pathname:
                                        '/(app)/task-detail',
                                    params: {
                                        id: String(id),
                                    },
                                });
                            },
                        },
                    ]
                );

                return;
            }

            // =================================================
            // CREATE
            // =================================================

            const response = await fetch(
                `${API_URL}/api/projects/${selectedProjectId}/tasks`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(body),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    'Gagal membuat tugas'
                );
            }

            Alert.alert(
                'Berhasil',
                'Tugas berhasil dibuat',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            router.replace('/(app)/tasks');
                        },
                    },
                ]
            );
        } catch (error) {
            console.error(
                isEditMode
                    ? 'UPDATE TASK ERROR:'
                    : 'CREATE TASK ERROR:',
                error
            );

            Alert.alert(
                'Gagal',
                error instanceof Error
                    ? error.message
                    : 'Tidak dapat terhubung ke server'
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Memuat data tugas...
                </Text>
            </View>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* HEADER */}

            <View style={styles.header}>
                <Pressable onPress={() => router.replace('/(app)/tasks')}>
                    <Text style={styles.back}>
                        ‹
                    </Text>
                </Pressable>

                <View>
                    <Text style={styles.title}>
                        {isEditMode
                            ? 'Edit Tugas'
                            : 'Buat Tugas'}
                    </Text>

                    <Text style={styles.subtitle}>
                        {isEditMode
                            ? 'Ubah informasi tugas.'
                            : 'Tambahkan tugas baru ke proyek.'}
                    </Text>
                </View>
            </View>

            <View style={styles.form}>
                {/* NAMA TUGAS */}

                <Text style={styles.label}>
                    Nama Tugas
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Contoh: Membuat halaman login"
                    placeholderTextColor="#94A3B8"
                    value={title}
                    onChangeText={setTitle}
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
                    placeholder="Masukkan deskripsi tugas"
                    placeholderTextColor="#94A3B8"
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                {/* PROYEK */}

                <Text style={styles.label}>
                    Proyek
                </Text>

                <Pressable
                    style={styles.select}
                    onPress={() =>
                        setProjectModalVisible(true)
                    }
                >
                    <Text style={styles.selectText}>
                        {selectedProjectName}
                    </Text>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </Pressable>

                {/* MEMBER */}

                <Text style={styles.label}>
                    Ditugaskan Kepada
                </Text>

                <Pressable
                    style={styles.select}
                    onPress={() =>
                        setMemberModalVisible(true)
                    }
                >
                    <Text style={styles.selectText}>
                        {selectedMember}
                    </Text>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </Pressable>

                {/* PRIORITAS */}

                <Text style={styles.label}>
                    Prioritas
                </Text>

                <View style={styles.options}>
                    {[
                        'Rendah',
                        'Sedang',
                        'Tinggi',
                    ].map((priority) => (
                        <Pressable
                            key={priority}
                            style={
                                selectedPriority ===
                                    priority
                                    ? styles.optionActive
                                    : styles.option
                            }
                            onPress={() =>
                                setSelectedPriority(
                                    priority
                                )
                            }
                        >
                            <Text
                                style={
                                    selectedPriority ===
                                        priority
                                        ? styles.optionActiveText
                                        : styles.optionText
                                }
                            >
                                {priority}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* STATUS */}

                <Text style={styles.label}>
                    Status
                </Text>

                <View style={styles.options}>
                    {[
                        'TODO',
                        'IN PROGRESS',
                        'REVIEW',
                        'DONE',
                    ].map((status) => (
                        <Pressable
                            key={status}
                            style={
                                selectedStatus ===
                                    status
                                    ? styles.optionActive
                                    : styles.option
                            }
                            onPress={() =>
                                setSelectedStatus(
                                    status
                                )
                            }
                        >
                            <Text
                                style={
                                    selectedStatus ===
                                        status
                                        ? styles.optionActiveText
                                        : styles.optionText
                                }
                            >
                                {status}
                            </Text>
                        </Pressable>
                    ))}
                </View>

                {/* DEADLINE */}

                <Text style={styles.label}>
                    Deadline
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="Contoh: 2026-10-12"
                    placeholderTextColor="#94A3B8"
                    value={deadline}
                    onChangeText={setDeadline}
                />

                {/* BUTTON */}

                <Pressable
                    style={styles.saveButton}
                    onPress={handleSubmit}
                    disabled={saving}
                >
                    <Text style={styles.saveButtonText}>
                        {saving
                            ? 'Menyimpan...'
                            : isEditMode
                                ? 'Simpan Perubahan'
                                : 'Simpan Tugas'}
                    </Text>
                </Pressable>
            </View>

            {/* =================================================
                MODAL PROJECT
            ================================================= */}

            <Modal
                visible={projectModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setProjectModalVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Pilih Proyek
                        </Text>

                        {projects.map((project) => (
                            <Pressable
                                key={project.id}
                                style={styles.memberOption}
                                onPress={() => {
                                    setSelectedProjectId(
                                        project.id
                                    );

                                    setSelectedProjectName(
                                        project.name
                                    );

                                    setProjectModalVisible(
                                        false
                                    );
                                }}
                            >
                                <Text
                                    style={
                                        styles.memberName
                                    }
                                >
                                    {project.name}
                                </Text>
                            </Pressable>
                        ))}

                        <Pressable
                            style={
                                styles.cancelButton
                            }
                            onPress={() =>
                                setProjectModalVisible(
                                    false
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.cancelText
                                }
                            >
                                Batal
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {/* =================================================
                MODAL MEMBER
            ================================================= */}

            <Modal
                visible={memberModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() =>
                    setMemberModalVisible(false)
                }
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>
                            Pilih Member
                        </Text>

                        {members.map((member) => (
                            <Pressable
                                key={member.id}
                                style={styles.memberOption}
                                onPress={() => {
                                    setSelectedMemberId(
                                        member.id
                                    );

                                    setSelectedMember(
                                        member.name
                                    );

                                    setMemberModalVisible(
                                        false
                                    );
                                }}
                            >
                                <Text
                                    style={
                                        styles.memberName
                                    }
                                >
                                    {member.name}
                                </Text>

                                <Text
                                    style={
                                        styles.memberRole
                                    }
                                >
                                    {member.role}
                                </Text>
                            </Pressable>
                        ))}

                        <Pressable
                            style={
                                styles.cancelButton
                            }
                            onPress={() =>
                                setMemberModalVisible(
                                    false
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.cancelText
                                }
                            >
                                Batal
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

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

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
    },

    loadingText: {
        color: '#64748B',
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
        height: 100,
        paddingTop: 14,
    },

    select: {
        height: 48,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },

    selectText: {
        fontSize: 13,
        color: '#0F172A',
    },

    arrow: {
        fontSize: 22,
        color: '#94A3B8',
    },

    options: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },

    option: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 11,
        alignItems: 'center',
    },

    optionActive: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 10,
        paddingVertical: 11,
        alignItems: 'center',
    },

    optionText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#64748B',
    },

    optionActiveText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    saveButton: {
        backgroundColor: '#0F172A',
        borderRadius: 12,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 4,
    },

    saveButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
        justifyContent: 'center',
        padding: 24,
    },

    modalCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 20,
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },

    memberOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },

    memberName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0F172A',
    },

    memberRole: {
        fontSize: 11,
        color: '#64748B',
    },

    cancelButton: {
        marginTop: 16,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
    },

    cancelText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },
});