import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { API_URL } from '../../constants/api';
import {
    getToken,
    getUser,
} from '../../utils/storage';

export default function MyTasksScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] =
        useState('Semua');

    useFocusEffect(
        useCallback(() => {
            fetchMyTasks();
        }, [])
    );

    const fetchMyTasks = async () => {
        try {
            setLoading(true);

            const token = await getToken();
            const currentUser = await getUser();

            setUser(currentUser);

            if (!token || !currentUser) {
                router.replace('/login');
                return;
            }

            // ==========================================
            // AMBIL SEMUA PROJECT
            // ==========================================

            const projectResponse =
                await fetch(
                    `${API_URL}/api/projects`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const projects =
                await projectResponse.json();

            if (!projectResponse.ok) {
                throw new Error(
                    projects.message ||
                    'Gagal mengambil proyek'
                );
            }

            const allTasks: any[] = [];

            // ==========================================
            // AMBIL TASK DARI SETIAP PROJECT
            // ==========================================

            for (const project of projects) {
                const taskResponse =
                    await fetch(
                        `${API_URL}/api/projects/${project.id}/tasks`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                const taskData =
                    await taskResponse.json();

                if (!taskResponse.ok) {
                    continue;
                }

                const projectTasks =
                    taskData
                        .filter(
                            (task: any) =>
                                Number(
                                    task.assigned_to
                                ) ===
                                Number(
                                    currentUser.id
                                )
                        )
                        .map(
                            (task: any) => ({
                                ...task,
                                project_name:
                                    project.name,
                            })
                        );

                allTasks.push(
                    ...projectTasks
                );
            }

            setTasks(allTasks);
        } catch (error) {
            console.error(
                'GAGAL MENGAMBIL MY TASKS:',
                error
            );

            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // FILTER
    // ==========================================

    const filteredTasks =
        tasks.filter((task) => {
            if (
                activeFilter ===
                'Berjalan'
            ) {
                return task.status !== 'DONE';
            }

            if (
                activeFilter ===
                'Selesai'
            ) {
                return task.status === 'DONE';
            }

            return true;
        });

    // ==========================================
    // FORMAT DEADLINE
    // ==========================================

    const formatDeadline = (
        date: string | null
    ) => {
        if (!date) return '-';

        return String(date).split('T')[0];
    };

    // ==========================================
    // FORMAT PRIORITY
    // ==========================================

    const formatPriority = (
        priority: string
    ) => {
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

    const getPriorityStyle = (
        priority: string
    ) => {
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

    const getPriorityTextStyle = (
        priority: string
    ) => {
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

    // ==========================================
    // FORMAT STATUS
    // ==========================================

    const formatStatus = (
        status: string
    ) => {
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
                return status;
        }
    };

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <View
                style={
                    styles.loadingContainer
                }
            >
                <ActivityIndicator
                    size="large"
                />

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Memuat tugas saya...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* HEADER */}

            <View style={styles.header}>
                <Text style={styles.title}>
                    Tugas Saya
                </Text>

                <Text style={styles.subtitle}>
                    Tugas yang diberikan kepada kamu.
                </Text>
            </View>

            {/* SUMMARY */}

            <View style={styles.summaryCard}>

                <View
                    style={
                        styles.summaryItem
                    }
                >
                    <Text
                        style={
                            styles.summaryNumber
                        }
                    >
                        {tasks.length}
                    </Text>

                    <Text
                        style={
                            styles.summaryLabel
                        }
                    >
                        Total Tugas
                    </Text>
                </View>

                <View
                    style={
                        styles.summaryItem
                    }
                >
                    <Text
                        style={
                            styles.summaryNumber
                        }
                    >
                        {
                            tasks.filter(
                                (task) =>
                                    task.status !==
                                    'DONE'
                            ).length
                        }
                    </Text>

                    <Text
                        style={
                            styles.summaryLabel
                        }
                    >
                        Belum Selesai
                    </Text>
                </View>

                <View
                    style={
                        styles.summaryItem
                    }
                >
                    <Text
                        style={
                            styles.summaryNumber
                        }
                    >
                        {
                            tasks.filter(
                                (task) =>
                                    task.status ===
                                    'DONE'
                            ).length
                        }
                    </Text>

                    <Text
                        style={
                            styles.summaryLabel
                        }
                    >
                        Selesai
                    </Text>
                </View>

            </View>

            {/* FILTER */}

            <View
                style={
                    styles.filterContainer
                }
            >
                {[
                    'Semua',
                    'Berjalan',
                    'Selesai',
                ].map((filter) => (
                    <Pressable
                        key={filter}
                        style={[
                            styles.filter,
                            activeFilter ===
                                filter &&
                                styles.filterActive,
                        ]}
                        onPress={() =>
                            setActiveFilter(
                                filter
                            )
                        }
                    >
                        <Text
                            style={
                                activeFilter ===
                                    filter
                                    ? styles.filterActiveText
                                    : styles.filterText
                            }
                        >
                            {filter}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {/* TASK LIST */}

            {filteredTasks.length === 0 ? (
                <View
                    style={
                        styles.emptyCard
                    }
                >
                    <View
                        style={
                            styles.emptyIcon
                        }
                    >
                        <Text
                            style={
                                styles.emptyIconText
                            }
                        >
                            ✓
                        </Text>
                    </View>

                    <Text
                        style={
                            styles.emptyTitle
                        }
                    >
                        Tidak ada tugas
                    </Text>

                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        {activeFilter ===
                        'Selesai'
                            ? 'Belum ada tugas yang selesai.'
                            : activeFilter ===
                                'Berjalan'
                                ? 'Tidak ada tugas yang sedang dikerjakan.'
                                : 'Belum ada tugas yang diberikan kepada kamu.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) =>
                        String(item.id)
                    }
                    contentContainerStyle={
                        styles.taskList
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                    ItemSeparatorComponent={() => (
                        <View
                            style={
                                styles.separator
                            }
                        />
                    )}
                    renderItem={({
                        item: task,
                    }) => (
                        <Pressable
                            style={
                                styles.taskCard
                            }
                            onPress={() =>
                                router.push({
                                    pathname:
                                        '/(app)/task-detail',
                                    params: {
                                        id: String(
                                            task.id
                                        ),

                                        // Menandakan
                                        // detail dibuka
                                        // dari Tugas Saya
                                        from: 'my-tasks',
                                    },
                                })
                            }
                        >

                            {/* TASK HEADER */}

                            <View
                                style={
                                    styles.taskHeader
                                }
                            >
                                <View
                                    style={
                                        styles.taskInfo
                                    }
                                >
                                    <Text
                                        style={
                                            styles.taskTitle
                                        }
                                        numberOfLines={1}
                                    >
                                        {task.title}
                                    </Text>

                                    <Text
                                        style={
                                            styles.projectName
                                        }
                                        numberOfLines={1}
                                    >
                                        {task.project_name ||
                                            'Tanpa proyek'}
                                    </Text>
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
                                        {formatPriority(
                                            task.priority
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {/* DIVIDER */}

                            <View
                                style={
                                    styles.divider
                                }
                            />

                            {/* TASK FOOTER */}

                            <View
                                style={
                                    styles.taskFooter
                                }
                            >
                                <View
                                    style={
                                        styles.footerItem
                                    }
                                >
                                    <Text
                                        style={
                                            styles.label
                                        }
                                    >
                                        Status
                                    </Text>

                                    <Text
                                        style={
                                            styles.status
                                        }
                                    >
                                        {formatStatus(
                                            task.status
                                        )}
                                    </Text>
                                </View>

                                <View
                                    style={
                                        styles.footerItem
                                    }
                                >
                                    <Text
                                        style={
                                            styles.label
                                        }
                                    >
                                        Deadline
                                    </Text>

                                    <Text
                                        style={
                                            styles.value
                                        }
                                    >
                                        {formatDeadline(
                                            task.deadline
                                        )}
                                    </Text>
                                </View>
                            </View>

                        </Pressable>
                    )}
                />
            )}

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 24,
        paddingTop: 60,
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
        flexShrink: 0,
    },

    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
    },

    subtitle: {
        marginTop: 6,
        fontSize: 14,
        color: '#64748B',
    },

    summaryCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },

    summaryNumber: {
        fontSize: 22,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },

    summaryLabel: {
        marginTop: 4,
        fontSize: 11,
        color: '#64748B',
        textAlign: 'center',
    },

    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 24,
    },

    filter: {
        paddingHorizontal: 16,
        paddingVertical: 9,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    filterActive: {
        backgroundColor: '#0F172A',
        borderColor: '#0F172A',
    },

    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },

    filterActiveText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    taskList: {
        paddingTop: 18,
        paddingBottom: 40,
    },

    separator: {
        height: 12,
    },

    taskCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    taskInfo: {
        flex: 1,
        marginRight: 8,
    },

    taskTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },

    projectName: {
        marginTop: 4,
        fontSize: 12,
        color: '#64748B',
    },

    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginVertical: 16,
    },

    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },

    footerItem: {
        flex: 1,
    },

    label: {
        fontSize: 10,
        color: '#94A3B8',
        marginBottom: 4,
    },

    status: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0F172A',
    },

    value: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
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
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginTop: 18,
        marginBottom: 40,
    },

    emptyIcon: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },

    emptyIconText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#475569',
    },

    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },

    emptyText: {
        marginTop: 6,
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
        textAlign: 'center',
    },

});