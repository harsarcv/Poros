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

export default function TasksScreen() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] =
        useState('Semua');

    useFocusEffect(
        useCallback(() => {
            const fetchTasks = async () => {
                try {
                    setLoading(true);

                    const token = await getToken();
                    const currentUser = await getUser();

                    setUser(currentUser);

                    if (!token) {
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

                    if (projects.length === 0) {
                        setTasks([]);
                        return;
                    }

                    // ==========================================
                    // AMBIL TASK DARI SEMUA PROJECT
                    // ==========================================

                    const allTasks: any[] = [];

                    for (
                        const project of projects
                    ) {
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
                            throw new Error(
                                taskData.message ||
                                'Gagal mengambil tugas'
                            );
                        }

                        // Tambahkan nama project
                        // ke setiap task

                        const projectTasks =
                            taskData.map(
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
                        'Gagal mengambil tugas:',
                        error
                    );

                    setTasks([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchTasks();
        }, [])
    );

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
    // FILTER
    // ==========================================

    const filteredTasks = tasks.filter(
        (task) => {
            if (
                activeFilter === 'Berjalan'
            ) {
                return task.status !== 'DONE';
            }

            if (
                activeFilter === 'Selesai'
            ) {
                return task.status === 'DONE';
            }

            return true;
        }
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />

                <Text style={styles.loadingText}>
                    Memuat tugas...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>

            {/* HEADER */}

            <View style={styles.header}>
                <View style={styles.headerInfo}>
                    <Text style={styles.title}>
                        Tugas
                    </Text>

                    <Text style={styles.subtitle}>
                        {isManager
                            ? 'Kelola tugas yang harus dikerjakan tim.'
                            : 'Lihat tugas yang harus dikerjakan.'}
                    </Text>
                </View>

                {/* PLUS HANYA ADMIN / MANAGER */}

                {isManager && (
                    <Pressable
                        style={styles.addButton}
                        onPress={() =>
                            router.push(
                                '/(app)/create-task'
                            )
                        }
                    >
                        <Text
                            style={
                                styles.addButtonText
                            }
                        >
                            +
                        </Text>
                    </Pressable>
                )}
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

            {tasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text
                        style={styles.emptyText}
                    >
                        Belum ada tugas.
                    </Text>
                </View>
            ) : filteredTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text
                        style={styles.emptyText}
                    >
                        Tidak ada tugas pada filter ini.
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
                                    },
                                })
                            }
                        >

                            {/* TASK HEADER */}

                            <View style={styles.taskHeader}>
                                <View style={styles.taskInfo}>
                                    <Text
                                        style={styles.taskTitle}
                                        numberOfLines={2}
                                    >
                                        {task.title}
                                    </Text>

                                    <Text
                                        style={styles.assignedText}
                                        numberOfLines={1}
                                    >
                                        Ditugaskan kepada:{' '}
                                        {task.assigned_name ||
                                            'Belum ditugaskan'}
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
                                        {task.status}
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
                                        Prioritas
                                    </Text>

                                    <Text
                                        style={
                                            styles.value
                                        }
                                    >
                                        {task.priority}
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
                                        {task.deadline
                                            ? String(
                                                task.deadline
                                            ).split(
                                                'T'
                                            )[0]
                                            : '-'}
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
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },

    headerInfo: {
        flex: 1,
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

    addButton: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    addButtonText: {
        color: '#FFFFFF',
        fontSize: 26,
        lineHeight: 28,
    },

    filterContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 28,
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

    taskIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    taskIconText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#0F172A',
    },

    taskInfo: {
        flex: 1,
    },

    taskTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },

    assignedText: {
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
        fontSize: 10,
        fontWeight: '700',
        color: '#0F172A',
    },

    value: {
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 40,
    },

    emptyText: {
        color: '#64748B',
        fontSize: 13,
    },
});