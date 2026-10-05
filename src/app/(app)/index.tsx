import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { API_URL } from '../../constants/api';
import { getToken, getUser } from '../../utils/storage';

type Project = {
    id: number;
    name: string;
    description?: string;
    deadline?: string;
    status: string;
    total_tasks: number;
    completed_tasks: number;
    progress: number;
};

type Task = {
    id: number;
    title: string;
    description?: string;
    project_id: number;
    project_name?: string;
    assigned_to?: number;
    assigned_name?: string;
    priority: string;
    status: string;
    deadline?: string;
};

export default function DashboardScreen() {
    const [user, setUser] = useState<any>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadDashboard();
        }, [])
    );

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const token = await getToken();

            if (!token) {
                router.replace('/login');
                return;
            }

            const currentUser = await getUser();

            try {
                const userResponse = await fetch(
                    `${API_URL}/api/users/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (userResponse.ok) {
                    const latestUser =
                        await userResponse.json();

                    setUser(latestUser);
                } else {
                    setUser(currentUser);
                }
            } catch (error) {
                console.error(
                    'Gagal mengambil data user terbaru:',
                    error
                );

                setUser(currentUser);
            }

            const projectResponse = await fetch(
                `${API_URL}/api/projects`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!projectResponse.ok) {
                throw new Error('Gagal mengambil project');
            }

            const projectData = await projectResponse.json();

            setProjects(
                Array.isArray(projectData)
                    ? projectData
                    : []
            );

            const allTasks: Task[] = [];

            for (const project of projectData) {
                try {
                    const taskResponse = await fetch(
                        `${API_URL}/api/projects/${project.id}/tasks`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (taskResponse.ok) {
                        const taskData = await taskResponse.json();

                        if (Array.isArray(taskData)) {
                            const projectTasks = taskData.map(
                                (task: Task) => ({
                                    ...task,
                                    project_name: project.name,
                                })
                            );

                            allTasks.push(...projectTasks);
                        }
                    }
                } catch (error) {
                    console.error(
                        `Gagal mengambil task project ${project.id}:`,
                        error
                    );
                }
            }

            setTasks(allTasks);
        } catch (error) {
            console.error('DASHBOARD ERROR:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDeadline = (date?: string) => {
        if (!date) return 'Tanpa deadline';

        const cleanDate = String(date).split('T')[0];
        const parts = cleanDate.split('-');

        if (parts.length !== 3) {
            return cleanDate;
        }

        const year = parts[0];
        const month = Number(parts[1]);
        const day = Number(parts[2]);

        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'Mei',
            'Jun',
            'Jul',
            'Agu',
            'Sep',
            'Okt',
            'Nov',
            'Des',
        ];

        return `${day} ${months[month - 1]} ${year}`;
    };

    const getPriorityLabel = (priority?: string) => {
        switch (priority) {
            case 'TINGGI':
                return 'Tinggi';

            case 'SEDANG':
                return 'Sedang';

            case 'RENDAH':
                return 'Rendah';

            default:
                return priority || '-';
        }
    };

    const getPriorityStyle = (priority?: string) => {
        switch (priority) {
            case 'TINGGI':
                return styles.priorityHigh;

            case 'SEDANG':
                return styles.priorityMedium;

            case 'RENDAH':
                return styles.priorityLow;

            default:
                return styles.priorityDefault;
        }
    };

    const getPriorityTextStyle = (priority?: string) => {
        switch (priority) {
            case 'TINGGI':
                return styles.priorityHighText;

            case 'SEDANG':
                return styles.priorityMediumText;

            case 'RENDAH':
                return styles.priorityLowText;

            default:
                return styles.priorityDefaultText;
        }
    };

    const getStatusLabel = (status?: string) => {
        switch (status) {
            case 'TODO':
                return 'To Do';

            case 'IN PROGRESS':
                return 'In Progress';

            case 'REVIEW':
                return 'Review';

            case 'DONE':
                return 'Selesai';

            default:
                return status || '-';
        }
    };

    const role = String(user?.role || '').toUpperCase();

    const isAdmin =
        role === 'ADMIN' ||
        role === 'MANAGER' ||
        role === 'ADMIN/MANAGER';

    const isMember = role === 'MEMBER';

    // =========================
    // STATISTIK UMUM
    // =========================

    const totalProjects = projects.length;

    const activeProjects = projects.filter(
        (project) => project.status !== 'SELESAI'
    );

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
        (task) => task.status === 'DONE'
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === 'IN PROGRESS'
    ).length;

    const reviewTasks = tasks.filter(
        (task) => task.status === 'REVIEW'
    ).length;

    // =========================
    // TASK MEMBER
    // =========================

    const myTasks = tasks.filter(
        (task) =>
            Number(task.assigned_to) === Number(user?.id)
    );

    const myActiveTasks = myTasks.filter(
        (task) => task.status !== 'DONE'
    );

    const myCompletedTasks = myTasks.filter(
        (task) => task.status === 'DONE'
    );

    const visibleTasks = myActiveTasks.slice(0, 3);

    // =========================
    // PROJECT
    // =========================

    const latestProjects = activeProjects.slice(0, 2);

    // =========================
    // ADMIN TASK
    // =========================

    const adminAttentionTasks = tasks
        .filter((task) => task.status === 'REVIEW')
        .sort((a, b) => {
            const priorityOrder: Record<string, number> = {
                TINGGI: 1,
                SEDANG: 2,
                RENDAH: 3,
            };

            return (
                (priorityOrder[a.priority] || 4) -
                (priorityOrder[b.priority] || 4)
            );
        })
        .slice(0, 3);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />

                <Text style={styles.loadingText}>
                    Memuat beranda...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* =========================
                HEADER
            ========================= */}

            <View style={styles.header}>
                <View style={styles.headerInfo}>


                    <Text style={styles.name}>
                        {user?.name || 'Pengguna'}
                    </Text>

                    <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>
                            {isAdmin
                                ? role === 'MANAGER'
                                    ? 'MANAGER'
                                    : 'ADMIN'
                                : 'MEMBER'}
                        </Text>
                    </View>
                </View>

                <Pressable
                    style={styles.avatar}
                    onPress={() =>
                        router.push('/(app)/profile')
                    }
                >
                    {user?.profile_image ? (
                        <Image
                            source={{
                                uri: `${API_URL}${user.profile_image}`,
                            }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {user?.name
                                ?.charAt(0)
                                ?.toUpperCase() || '?'}
                        </Text>
                    )}
                </Pressable>
            </View>

            {/* =================================================
                DASHBOARD ADMIN / MANAGER
            ================================================= */}

            {isAdmin && (
                <>
                    {/* SUMMARY ADMIN */}

                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>
                            Ringkasan Proyek
                        </Text>

                        <View style={styles.stats}>
                            <View style={styles.statCard}>

                                <Text style={styles.statNumber}>
                                    {totalProjects}
                                </Text>

                                <Text style={styles.statLabel}>
                                    Total Proyek
                                </Text>
                            </View>

                            <View style={styles.statCard}>

                                <Text style={styles.statNumber}>
                                    {totalTasks}
                                </Text>

                                <Text style={styles.statLabel}>
                                    Total Tugas
                                </Text>
                            </View>

                            <View style={styles.statCard}>

                                <Text style={styles.statNumber}>
                                    {completedTasks}
                                </Text>

                                <Text style={styles.statLabel}>
                                    Tugas Selesai
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* STATUS TUGAS */}

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Status Tugas
                        </Text>
                    </View>

                    <View style={styles.statusGrid}>
                        <View style={styles.statusCard}>
                            <Text style={styles.statusNumber}>
                                {inProgressTasks}
                            </Text>

                            <Text style={styles.statusLabel}>
                                In Progress
                            </Text>
                        </View>

                        <View style={styles.statusCard}>
                            <Text style={styles.statusNumber}>
                                {reviewTasks}
                            </Text>

                            <Text style={styles.statusLabel}>
                                Review
                            </Text>
                        </View>

                        <View style={styles.statusCard}>
                            <Text style={styles.statusNumber}>
                                {completedTasks}
                            </Text>

                            <Text style={styles.statusLabel}>
                                Selesai
                            </Text>
                        </View>
                    </View>

                    {/* PROYEK AKTIF */}

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Proyek Aktif
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.push('/(app)/projects')
                            }
                        >
                            <Text style={styles.seeAll}>
                                Lihat Semua Proyek
                            </Text>
                        </Pressable>
                    </View>

                    {latestProjects.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>
                                Belum ada proyek aktif
                            </Text>

                            <Text style={styles.emptyText}>
                                Buat proyek baru untuk mulai mengelola pekerjaan tim.
                            </Text>

                            <Pressable
                                style={styles.emptyButton}
                                onPress={() =>
                                    router.push(
                                        '/(app)/create-project'
                                    )
                                }
                            >
                                <Text style={styles.emptyButtonText}>
                                    Buat Proyek
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        latestProjects.map((project) => (
                            <Pressable
                                key={project.id}
                                style={styles.projectCard}
                                onPress={() =>
                                    router.push({
                                        pathname:
                                            '/(app)/project-detail',
                                        params: {
                                            id: String(project.id),
                                        },
                                    })
                                }
                            >
                                <View style={styles.projectTop}>
                                    <View style={styles.projectInfo}>
                                        <Text
                                            style={styles.projectName}
                                            numberOfLines={1}
                                        >
                                            {project.name}
                                        </Text>

                                        <Text
                                            style={styles.projectDescription}
                                            numberOfLines={2}
                                        >
                                            {project.description ||
                                                'Tidak ada deskripsi proyek'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.progressHeader}>
                                    <Text
                                        style={
                                            styles.progressLabel
                                        }
                                    >
                                        Kemajuan
                                    </Text>

                                    <Text
                                        style={
                                            styles.progressValue
                                        }
                                    >
                                        {project.progress || 0}%
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
                                                width: `${Math.min(
                                                    Math.max(
                                                        project.progress ||
                                                        0,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                            },
                                        ]}
                                    />
                                </View>

                                <View
                                    style={styles.projectFooter}
                                >
                                    <Text
                                        style={styles.taskCount}
                                    >
                                        {project.completed_tasks ||
                                            0}{' '}
                                        dari{' '}
                                        {project.total_tasks ||
                                            0}{' '}
                                        tugas selesai
                                    </Text>

                                    <Text
                                        style={styles.deadline}
                                    >
                                        {formatDeadline(
                                            project.deadline
                                        )}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    )}

                    {/* TUGAS YANG PERLU DIPERHATIKAN */}

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Tugas Perlu Perhatian
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.push('/(app)/tasks')
                            }
                        >
                            <Text style={styles.seeAll}>
                                Lihat Semua Tugas
                            </Text>
                        </Pressable>
                    </View>

                    {adminAttentionTasks.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>
                                Belum ada tugas yang perlu di review
                            </Text>

                            <Text style={styles.emptyText}>
                                Tidak ada tugas yang perlu diperhatikan saat ini.
                            </Text>
                        </View>
                    ) : (
                        adminAttentionTasks.map((task) => (
                            <Pressable
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() =>
                                    router.push({
                                        pathname:
                                            '/(app)/task-detail',
                                        params: {
                                            id: String(task.id),
                                        },
                                    })
                                }
                            >
                                <View
                                    style={[
                                        styles.taskIndicator,
                                        task.priority ===
                                        'TINGGI' &&
                                        styles.taskIndicatorHigh,
                                        task.priority ===
                                        'SEDANG' &&
                                        styles.taskIndicatorMedium,
                                        task.priority ===
                                        'RENDAH' &&
                                        styles.taskIndicatorLow,
                                    ]}
                                />

                                <View style={styles.taskInfo}>
                                    <Text
                                        style={styles.taskTitle}
                                        numberOfLines={1}
                                    >
                                        {task.title}
                                    </Text>

                                    <Text
                                        style={styles.taskProject}
                                        numberOfLines={1}
                                    >
                                        {task.project_name ||
                                            'Tanpa proyek'}
                                    </Text>

                                    <View style={styles.taskMeta}>
                                        <Text
                                            style={
                                                styles.taskStatus
                                            }
                                        >
                                            {getStatusLabel(
                                                task.status
                                            )}
                                        </Text>

                                        {task.assigned_name && (
                                            <Text
                                                style={
                                                    styles.taskDeadline
                                                }
                                            >
                                                •{' '}
                                                {
                                                    task.assigned_name
                                                }
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View
                                    style={getPriorityStyle(
                                        task.priority
                                    )}
                                >
                                    <Text
                                        style={getPriorityTextStyle(
                                            task.priority
                                        )}
                                    >
                                        {getPriorityLabel(
                                            task.priority
                                        )}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    )}
                </>
            )}

            {/* =================================================
                DASHBOARD MEMBER
            ================================================= */}

            {isMember && (
                <>
                    {/* SUMMARY MEMBER */}

                    <View style={styles.summary}>
                        <Text style={styles.summaryTitle}>
                            Ringkasan Saya
                        </Text>

                        <View style={styles.stats}>
                            <View style={styles.statCard}>

                                <Text style={styles.statNumber}>
                                    {totalProjects}
                                </Text>

                                <Text style={styles.statLabel}>
                                    Proyek
                                </Text>
                            </View>

                            <View style={styles.statCard}>

                                <Text style={styles.statNumber}>
                                    {myActiveTasks.length}
                                </Text>

                                <Text style={styles.statLabel}>
                                    Tugas Aktif
                                </Text>
                            </View>

                            <View style={styles.statCard}>

                                <Text style={styles.statNumber}>
                                    {myCompletedTasks.length}
                                </Text>

                                <Text style={styles.statLabel}>
                                    Selesai
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* TUGAS SAYA */}

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Tugas Saya
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.push('/(app)/my-tasks')
                            }
                        >
                            <Text style={styles.seeAll}>
                                Lihat Semua
                            </Text>
                        </Pressable>
                    </View>

                    {visibleTasks.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>
                                Tidak ada tugas aktif
                            </Text>

                            <Text style={styles.emptyText}>
                                Tugas yang diberikan kepada kamu akan muncul di sini.
                            </Text>

                            <Pressable
                                style={styles.emptyButton}
                                onPress={() =>
                                    router.push('/(app)/my-tasks')
                                }
                            >
                                <Text
                                    style={
                                        styles.emptyButtonText
                                    }
                                >
                                    Lihat Tugas Saya
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        visibleTasks.map((task) => (
                            <Pressable
                                key={task.id}
                                style={styles.taskCard}
                                onPress={() =>
                                    router.push({
                                        pathname:
                                            '/(app)/task-detail',
                                        params: {
                                            id: String(task.id),
                                        },
                                    })
                                }
                            >
                                <View
                                    style={[
                                        styles.taskIndicator,
                                        task.priority ===
                                        'TINGGI' &&
                                        styles.taskIndicatorHigh,
                                        task.priority ===
                                        'SEDANG' &&
                                        styles.taskIndicatorMedium,
                                        task.priority ===
                                        'RENDAH' &&
                                        styles.taskIndicatorLow,
                                    ]}
                                />

                                <View style={styles.taskInfo}>
                                    <Text
                                        style={styles.taskTitle}
                                        numberOfLines={1}
                                    >
                                        {task.title}
                                    </Text>

                                    <Text
                                        style={styles.taskProject}
                                        numberOfLines={1}
                                    >
                                        {task.project_name ||
                                            'Tanpa proyek'}
                                    </Text>

                                    <View style={styles.taskMeta}>
                                        <Text
                                            style={
                                                styles.taskStatus
                                            }
                                        >
                                            {getStatusLabel(
                                                task.status
                                            )}
                                        </Text>

                                        {task.deadline && (
                                            <Text
                                                style={
                                                    styles.taskDeadline
                                                }
                                            >
                                                •{' '}
                                                {formatDeadline(
                                                    task.deadline
                                                )}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                <View
                                    style={getPriorityStyle(
                                        task.priority
                                    )}
                                >
                                    <Text
                                        style={getPriorityTextStyle(
                                            task.priority
                                        )}
                                    >
                                        {getPriorityLabel(
                                            task.priority
                                        )}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    )}

                    {/* PROYEK MEMBER */}

                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Proyek Saya
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.push('/(app)/projects')
                            }
                        >
                            <Text style={styles.seeAll}>
                                Lihat Semua
                            </Text>
                        </Pressable>
                    </View>

                    {latestProjects.length === 0 ? (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyTitle}>
                                Belum ada proyek
                            </Text>

                            <Text style={styles.emptyText}>
                                Proyek yang kamu ikuti akan muncul di sini.
                            </Text>
                        </View>
                    ) : (
                        latestProjects.map((project) => (
                            <Pressable
                                key={project.id}
                                style={styles.projectCard}
                                onPress={() =>
                                    router.push({
                                        pathname:
                                            '/(app)/project-detail',
                                        params: {
                                            id: String(project.id),
                                        },
                                    })
                                }
                            >
                                <View style={styles.projectTop}>
                                    <View style={styles.projectInfo}>
                                        <Text
                                            style={styles.projectName}
                                            numberOfLines={1}
                                        >
                                            {project.name}
                                        </Text>

                                        <Text
                                            style={styles.projectDescription}
                                            numberOfLines={2}
                                        >
                                            {project.description ||
                                                'Tidak ada deskripsi proyek'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.progressHeader}>
                                    <Text
                                        style={
                                            styles.progressLabel
                                        }
                                    >
                                        Kemajuan
                                    </Text>

                                    <Text
                                        style={
                                            styles.progressValue
                                        }
                                    >
                                        {project.progress || 0}%
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
                                                width: `${Math.min(
                                                    Math.max(
                                                        project.progress ||
                                                        0,
                                                        0
                                                    ),
                                                    100
                                                )}%`,
                                            },
                                        ]}
                                    />
                                </View>

                                <View
                                    style={styles.projectFooter}
                                >
                                    <Text
                                        style={styles.taskCount}
                                    >
                                        {project.completed_tasks ||
                                            0}{' '}
                                        dari{' '}
                                        {project.total_tasks ||
                                            0}{' '}
                                        tugas selesai
                                    </Text>

                                    <Text
                                        style={styles.deadline}
                                    >
                                        {formatDeadline(
                                            project.deadline
                                        )}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    )}
                </>
            )}

            {/* ROLE TIDAK DIKENALI */}

            {!isAdmin && !isMember && (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                        Role belum dikenali
                    </Text>

                    <Text style={styles.emptyText}>
                        Silakan login kembali untuk memuat data akun.
                    </Text>

                    <Pressable
                        style={styles.emptyButton}
                        onPress={async () => {
                            router.replace('/login');
                        }}
                    >
                        <Text style={styles.emptyButtonText}>
                            Kembali ke Login
                        </Text>
                    </Pressable>
                </View>
            )}
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
        paddingTop: 60,
        paddingBottom: 40,
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
        justifyContent: 'space-between',
    },

    headerInfo: {
        flex: 1,
    },

    greeting: {
        fontSize: 14,
        color: '#64748B',
    },

    name: {
        marginTop: 4,
        fontSize: 26,
        fontWeight: '800',
        color: '#0F172A',
    },

    roleBadge: {
        alignSelf: 'flex-start',
        marginTop: 7,
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 7,
        backgroundColor: '#E2E8F0',
    },

    roleBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: '#475569',
    },

    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
    },

    summary: {
        marginTop: 28,
    },

    summaryTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 14,
    },

    stats: {
        flexDirection: 'row',
        gap: 10,
    },

    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },

    statNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },

    statLabel: {
        marginTop: 3,
        fontSize: 12,
        color: '#64748B',
        textAlign: 'center',
    },

    statusGrid: {
        flexDirection: 'row',
        gap: 10,
    },

    statusCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        alignItems: 'center',
    },

    statusNumber: {
        fontSize: 20,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },

    statusLabel: {
        marginTop: 4,
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
    },

    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 30,
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },

    seeAll: {
        fontSize: 13,
        fontWeight: '600',
        color: '#475569',
    },

    projectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    projectTop: {
        flexDirection: 'row',
    },

    projectIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    projectIconText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },

    projectInfo: {
        flex: 1,
    },

    projectName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },

    projectDescription: {
        marginTop: 4,
        fontSize: 12,
        lineHeight: 17,
        color: '#64748B',
    },

    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 8,
    },

    progressLabel: {
        fontSize: 12,
        color: '#64748B',
    },

    progressValue: {
        fontSize: 12,
        fontWeight: '700',
        color: '#0F172A',
    },

    progressBackground: {
        height: 7,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
    },

    progressBar: {
        height: '100%',
        backgroundColor: '#0F172A',
        borderRadius: 4,
    },

    projectFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
    },

    taskCount: {
        flex: 1,
        fontSize: 11,
        color: '#64748B',
    },

    deadline: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
        marginLeft: 10,
    },

    taskCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    taskIndicator: {
        width: 4,
        height: 48,
        borderRadius: 2,
        backgroundColor: '#94A3B8',
    },

    taskIndicatorHigh: {
        backgroundColor: '#DC2626',
    },

    taskIndicatorMedium: {
        backgroundColor: '#D97706',
    },

    taskIndicatorLow: {
        backgroundColor: '#16A34A',
    },

    taskInfo: {
        flex: 1,
        marginLeft: 12,
        marginRight: 8,
    },

    taskTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },

    taskProject: {
        marginTop: 4,
        fontSize: 11,
        color: '#64748B',
    },

    taskMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },

    taskStatus: {
        fontSize: 10,
        fontWeight: '600',
        color: '#64748B',
    },

    taskDeadline: {
        marginLeft: 5,
        fontSize: 10,
        color: '#94A3B8',
    },

    priorityHigh: {
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
    },

    priorityHighText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#B91C1C',
    },

    priorityMedium: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
    },

    priorityMediumText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#B45309',
    },

    priorityLow: {
        backgroundColor: '#DCFCE7',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
    },

    priorityLowText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#15803D',
    },

    priorityDefault: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 8,
    },

    priorityDefaultText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#475569',
    },

    emptyCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 22,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    emptyTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
        textAlign: 'center',
    },

    emptyText: {
        marginTop: 6,
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
        textAlign: 'center',
    },

    emptyButton: {
        marginTop: 14,
        backgroundColor: '#0F172A',
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 9,
    },

    emptyButtonText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    sectionTitleQuick: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 30,
        marginBottom: 14,
    },

    quickActions: {
        flexDirection: 'row',
        gap: 10,
    },

    quickCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    quickIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    quickIconText: {
        fontSize: 14,
        fontWeight: '800',
        color: '#475569',
    },

    quickTitle: {
        marginTop: 12,
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },

    quickSubtitle: {
        marginTop: 3,
        fontSize: 11,
        color: '#64748B',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
    },
});