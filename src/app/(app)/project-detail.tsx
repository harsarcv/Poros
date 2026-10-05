import {
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import {
    router,
    useFocusEffect,
    useLocalSearchParams,
} from 'expo-router';

import { useCallback, useState } from 'react';

import { API_URL } from '../../constants/api';
import { getToken, getUser } from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectDetail() {
    const { id } = useLocalSearchParams();

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchProjectDetail = async () => {
                try {
                    setLoading(true);

                    const token = await getToken();
                    const currentUser = await getUser();

                    setUser(currentUser);

                    const projectId = String(id);

                    // ==========================================
                    // 1. AMBIL SEMUA PROJECT
                    // ==========================================

                    const projectsResponse = await fetch(
                        `${API_URL}/api/projects`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const projectsData =
                        await projectsResponse.json();

                    if (!projectsResponse.ok) {
                        throw new Error(
                            projectsData.message ||
                            'Gagal mengambil data proyek'
                        );
                    }

                    // ==========================================
                    // 2. CARI PROJECT SESUAI ID
                    // ==========================================

                    const selectedProject =
                        projectsData.find(
                            (item: any) =>
                                String(item.id) === projectId
                        );

                    if (!selectedProject) {
                        throw new Error(
                            'Proyek tidak ditemukan'
                        );
                    }

                    setProject(selectedProject);

                    // ==========================================
                    // 3. AMBIL TASK PROJECT
                    // ==========================================

                    const tasksResponse = await fetch(
                        `${API_URL}/api/projects/${projectId}/tasks`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    const tasksData =
                        await tasksResponse.json();

                    if (!tasksResponse.ok) {
                        throw new Error(
                            tasksData.message ||
                            'Gagal mengambil tugas proyek'
                        );
                    }

                    setTasks(tasksData);
                } catch (error) {
                    console.error(
                        'PROJECT DETAIL ERROR:',
                        error
                    );
                } finally {
                    setLoading(false);
                }
            };

            if (id) {
                fetchProjectDetail();
            }
        }, [id])
    );

    // ==========================================
    // LOADING
    // ==========================================

    if (loading || !project) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                    Memuat detail proyek...
                </Text>
            </View>
        );
    }

    // ==========================================
    // ROLE
    // ==========================================

    const role = String(
        user?.role || ''
    ).toUpperCase();

    const isManager =
        role === 'ADMIN' ||
        role === 'MANAGER' ||
        role === 'ADMIN/MANAGER';

    // ==========================================
    // STATISTIK TASK
    // ==========================================

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.status === 'DONE'
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === 'IN PROGRESS'
    ).length;

    const progress =
        totalTasks === 0
            ? 0
            : Math.round(
                (completedTasks / totalTasks) * 100
            );

    // ==========================================
    // FORMAT DEADLINE
    // ==========================================

    const formatDate = (date: string | null) => {
        if (!date) {
            return 'Tidak ada deadline';
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            'id-ID',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }
        );
    };

    const handleDeleteProject = async () => {
        Alert.alert(
            'Hapus Proyek',
            'Apakah kamu yakin ingin menghapus proyek ini?',
            [
                {
                    text: 'Batal',
                    style: 'cancel',
                },
                {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = await getToken();

                            if (!token) {
                                Alert.alert(
                                    'Sesi Berakhir',
                                    'Sesi login tidak ditemukan.'
                                );
                                return;
                            }

                            const response = await fetch(
                                `${API_URL}/api/projects/${project.id}`,
                                {
                                    method: 'DELETE',
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                    },
                                }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                                Alert.alert(
                                    'Gagal',
                                    data.message ||
                                    'Gagal menghapus proyek.'
                                );
                                return;
                            }

                            Alert.alert(
                                'Berhasil',
                                'Proyek berhasil dihapus.',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () =>
                                            router.replace(
                                                '/(app)/projects'
                                            ),
                                    },
                                ]
                            );
                        } catch (error) {
                            console.error(
                                'DELETE PROJECT ERROR:',
                                error
                            );

                            Alert.alert(
                                'Error',
                                'Tidak dapat terhubung ke server.'
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['bottom']}
        >

            {/* HEADER */}

            <View style={styles.header}>

                <Pressable
                    onPress={() =>
                        router.replace(
                            '/(app)/projects'
                        )
                    }
                >
                    <Text style={styles.back}>
                        ‹
                    </Text>
                </Pressable>

                <View>
                    <Text style={styles.headerTitle}>
                        Detail Proyek
                    </Text>

                    <Text style={styles.headerSubtitle}>
                        Informasi proyek
                    </Text>
                </View>

            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >

                {/* PROJECT CARD */}

                <View style={styles.projectCard}>

                    <View style={styles.projectTop}>

                        <View style={styles.projectInfo}>

                            <Text style={styles.projectName}>
                                {project.name}
                            </Text>

                            <Text style={styles.projectDescription}>
                                {project.description ||
                                    'Tidak ada deskripsi'}
                            </Text>

                        </View>

                    </View>

                    {/* STATUS */}

                    <View style={styles.statusRow}>

                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>
                                {project.status}
                            </Text>
                        </View>

                        <Text style={styles.deadline}>
                            Deadline:{' '}
                            {formatDate(
                                project.deadline
                            )}
                        </Text>

                    </View>

                    {/* PROGRESS */}

                    <View style={styles.progressHeader}>

                        <Text style={styles.label}>
                            Progress
                        </Text>

                        <Text style={styles.progressText}>
                            {progress}%
                        </Text>

                    </View>

                    <View
                        style={
                            styles.progressBackground
                        }
                    >
                        <View
                            style={[
                                styles.progressBar,
                                {
                                    width: `${progress}%`,
                                },
                            ]}
                        />
                    </View>

                    {/* EDIT PROYEK */}

                    {isManager && (
                        <>
                            <Pressable
                                style={styles.editButton}
                                onPress={() =>
                                    router.push({
                                        pathname: '/(app)/create-project',
                                        params: {
                                            id: String(project.id),
                                        },
                                    })
                                }
                            >
                                <Text style={styles.editButtonText}>
                                    Edit Proyek
                                </Text>
                            </Pressable>

                            <Pressable
                                style={styles.deleteButton}
                                onPress={handleDeleteProject}
                            >
                                <Text style={styles.deleteButtonText}>
                                    Hapus Proyek
                                </Text>
                            </Pressable>
                        </>
                    )}

                </View>

                {/* RINGKASAN */}

                <Text style={styles.sectionTitle}>
                    Ringkasan
                </Text>

                <View style={styles.statsRow}>

                    <View style={styles.statCard}>
                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            {totalTasks}
                        </Text>

                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Total Tugas
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            {completedTasks}
                        </Text>

                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Selesai
                        </Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text
                            style={
                                styles.statNumber
                            }
                        >
                            {inProgressTasks}
                        </Text>

                        <Text
                            style={
                                styles.statLabel
                            }
                        >
                            Berjalan
                        </Text>
                    </View>

                </View>

                {/* TASK HEADER */}

                <View style={styles.taskHeader}>

                    <Text style={styles.sectionTitle}>
                        Tugas Proyek
                    </Text>

                    {/* HANYA ADMIN / MANAGER */}

                    {isManager && (
                        <Pressable
                            onPress={() =>
                                router.push({
                                    pathname:
                                        '/(app)/create-task',
                                    params: {
                                        projectId:
                                            String(
                                                project.id
                                            ),
                                        projectName:
                                            project.name,
                                    },
                                })
                            }
                        >
                            <Text style={styles.addText}>
                                + Tambah
                            </Text>
                        </Pressable>
                    )}

                </View>

                {/* TASK LIST */}

                {tasks.length === 0 ? (

                    <View style={styles.emptyContainer}>

                        <Text style={styles.emptyText}>
                            Belum ada tugas di proyek ini.
                        </Text>

                        {/* BUTTON TAMBAH HANYA MANAGER */}

                        {isManager && (
                            <Pressable
                                style={
                                    styles.emptyButton
                                }
                                onPress={() =>
                                    router.push({
                                        pathname:
                                            '/(app)/create-task',
                                        params: {
                                            projectId:
                                                String(
                                                    project.id
                                                ),
                                            projectName:
                                                project.name,
                                        },
                                    })
                                }
                            >
                                <Text
                                    style={
                                        styles.emptyButtonText
                                    }
                                >
                                    + Tambah Tugas
                                </Text>
                            </Pressable>
                        )}

                    </View>

                ) : (

                    tasks.map((task) => (

                        <Pressable
                            key={task.id}
                            style={styles.taskCard}
                            onPress={() =>
                                router.push({
                                    pathname:
                                        '/(app)/task-detail',
                                    params: {
                                        id: String(
                                            task.id
                                        ),
                                    },
                                })
                            }
                        >

                            <View
                                style={
                                    styles.taskContent
                                }
                            >

                                <Text
                                    style={
                                        styles.taskTitle
                                    }
                                >
                                    {task.title}
                                </Text>

                                <Text
                                    style={
                                        styles.assignee
                                    }
                                >
                                    Ditugaskan kepada{' '}
                                    {task.assigned_name ||
                                        'Belum ditugaskan'}
                                </Text>

                            </View>

                            <View
                                style={
                                    styles.taskRight
                                }
                            >

                                <Text
                                    style={
                                        styles.priority
                                    }
                                >
                                    {task.priority}
                                </Text>

                                <Text
                                    style={
                                        styles.taskStatus
                                    }
                                >
                                    {task.status}
                                </Text>

                            </View>

                        </Pressable>

                    ))

                )}

            </ScrollView>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({



    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingHorizontal: 20,
        paddingTop: 55,
        paddingBottom: 18,
        backgroundColor: '#FFFFFF',
    },

    back: {
        fontSize: 36,
        color: '#111827',
        lineHeight: 36,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },

    headerSubtitle: {
        marginTop: 3,
        fontSize: 13,
        color: '#64748B',
    },

    content: {
        padding: 20,
        paddingBottom: 40,
    },

    projectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 18,
        marginBottom: 24,
    },

    projectTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    icon: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#334155',
    },

    projectInfo: {
        flex: 1,
    },

    projectName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
    },

    projectDescription: {
        marginTop: 4,
        fontSize: 13,
        color: '#64748B',
    },

    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 18,
    },

    statusBadge: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },

    statusText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#15803D',
    },

    deadline: {
        fontSize: 12,
        color: '#64748B',
    },

    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 18,
        marginBottom: 8,
    },

    label: {
        fontSize: 13,
        color: '#64748B',
    },

    progressText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },

    progressBackground: {
        height: 8,
        borderRadius: 10,
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
    },

    progressBar: {
        height: '100%',
        backgroundColor: '#111827',
    },

    editButton: {
        marginTop: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingVertical: 11,
        alignItems: 'center',
    },

    editButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
    },

    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 24,
    },

    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 16,
        alignItems: 'center',
    },

    statNumber: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },

    statLabel: {
        marginTop: 5,
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
    },

    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    addText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111827',
    },

    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
    },

    taskContent: {
        flex: 1,
    },

    taskTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111827',
    },

    assignee: {
        marginTop: 5,
        fontSize: 11,
        color: '#64748B',
    },

    taskRight: {
        alignItems: 'flex-end',
        marginLeft: 10,
    },

    priority: {
        fontSize: 10,
        color: '#64748B',
        marginBottom: 5,
    },

    taskStatus: {
        fontSize: 10,
        fontWeight: '700',
        color: '#111827',
    },

    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        fontSize: 15,
        color: '#64748B',
    },

    emptyContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 20,
        alignItems: 'center',
    },

    emptyText: {
        fontSize: 13,
        color: '#64748B',
        textAlign: 'center',
    },

    emptyButton: {
        marginTop: 14,
        backgroundColor: '#111827',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 10,
    },

    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },

    deleteButton: {
        marginTop: 10,
        borderWidth: 1,
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
        borderRadius: 10,
        paddingVertical: 11,
        alignItems: 'center',
    },

    deleteButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#B91C1C',
    },
});