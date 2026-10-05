import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { API_URL } from '../../constants/api';
import { getToken, getUser } from '../../utils/storage';

export default function ProjectsScreen() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('SEMUA');
    const [user, setUser] = useState<any>(null);

    useFocusEffect(
        useCallback(() => {
            const fetchProjects = async () => {
                try {
                    setLoading(true);

                    const token = await getToken();
                    const currentUser = await getUser();

                    setUser(currentUser);

                    if (!token) {
                        router.replace('/login');
                        return;
                    }

                    const response = await fetch(
                        `${API_URL}/api/projects`,
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
                            'Gagal mengambil proyek'
                        );
                    }

                    setProjects(data);
                } catch (error) {
                    console.error(
                        'Gagal mengambil proyek:',
                        error
                    );
                } finally {
                    setLoading(false);
                }
            };

            fetchProjects();
        }, [])
    );

    const formatDate = (date: string | null) => {
        if (!date) {
            return 'Tidak ada deadline';
        }

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

    const role = String(
        user?.role || ''
    ).toUpperCase();

    const isManager =
        role === 'ADMIN' ||
        role === 'MANAGER' ||
        role === 'ADMIN/MANAGER';

    const filteredProjects = projects.filter(
        (project) => {
            if (activeFilter === 'AKTIF') {
                return project.status === 'AKTIF';
            }

            if (activeFilter === 'SELESAI') {
                return project.status === 'SELESAI';
            }

            return true;
        }
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />

                <Text style={styles.loadingText}>
                    Memuat proyek...
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
                        Proyek
                    </Text>

                    <Text style={styles.subtitle}>
                        {isManager
                            ? 'Kelola proyek dan pekerjaan tim.'
                            : 'Lihat proyek dan pekerjaan tim.'}
                    </Text>
                </View>

                {/* HANYA ADMIN / MANAGER */}

                {isManager && (
                    <Pressable
                        style={styles.addButton}
                        onPress={() =>
                            router.push(
                                '/(app)/create-project'
                            )
                        }
                    >
                        <Text
                            style={styles.addButtonText}
                        >
                            +
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* FILTER */}

            <View style={styles.filterContainer}>
                <Pressable
                    style={[
                        styles.filter,
                        activeFilter === 'SEMUA' &&
                        styles.filterActive,
                    ]}
                    onPress={() =>
                        setActiveFilter('SEMUA')
                    }
                >
                    <Text
                        style={
                            activeFilter === 'SEMUA'
                                ? styles.filterActiveText
                                : styles.filterText
                        }
                    >
                        Semua
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.filter,
                        activeFilter === 'AKTIF' &&
                        styles.filterActive,
                    ]}
                    onPress={() =>
                        setActiveFilter('AKTIF')
                    }
                >
                    <Text
                        style={
                            activeFilter === 'AKTIF'
                                ? styles.filterActiveText
                                : styles.filterText
                        }
                    >
                        Aktif
                    </Text>
                </Pressable>

                <Pressable
                    style={[
                        styles.filter,
                        activeFilter === 'SELESAI' &&
                        styles.filterActive,
                    ]}
                    onPress={() =>
                        setActiveFilter('SELESAI')
                    }
                >
                    <Text
                        style={
                            activeFilter === 'SELESAI'
                                ? styles.filterActiveText
                                : styles.filterText
                        }
                    >
                        Selesai
                    </Text>
                </Pressable>
            </View>

            {/* PROJECT LIST */}

            {filteredProjects.length === 0 ? (
                <View style={styles.emptyCard}>
                    <Text style={styles.emptyTitle}>
                        Belum ada proyek
                    </Text>

                    <Text style={styles.emptyText}>
                        {isManager
                            ? 'Buat proyek baru untuk mulai mengelola pekerjaan tim.'
                            : 'Proyek yang tersedia akan muncul di sini.'}
                    </Text>

                    {isManager && (
                        <Pressable
                            style={styles.emptyButton}
                            onPress={() =>
                                router.push(
                                    '/(app)/create-project'
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.emptyButtonText
                                }
                            >
                                Buat Proyek
                            </Text>
                        </Pressable>
                    )}
                </View>
            ) : (
                <FlatList
                    data={filteredProjects}
                    keyExtractor={(item) =>
                        String(item.id)
                    }
                    renderItem={({ item: project }) => (
                        <Pressable
                            style={styles.projectCard}
                            onPress={() =>
                                router.push({
                                    pathname:
                                        '/(app)/project-detail',
                                    params: {
                                        id: String(
                                            project.id
                                        ),
                                    },
                                })
                            }
                        >
                            {/* CARD HEADER */}

                            <View style={styles.cardHeader}>
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

                                {isManager && (
                                    <Text style={styles.menu}>
                                        •••
                                    </Text>
                                )}
                            </View>

                            {/* PROGRESS */}

                            <View
                                style={
                                    styles.progressHeader
                                }
                            >
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

                            {/* CARD FOOTER */}

                            <View
                                style={
                                    styles.cardFooter
                                }
                            >
                                <Text
                                    style={
                                        styles.taskText
                                    }
                                >
                                    {project.total_tasks ||
                                        0}{' '}
                                    tugas
                                </Text>

                                <Text
                                    style={
                                        styles.deadline
                                    }
                                >
                                    {formatDate(
                                        project.deadline
                                    )}
                                </Text>
                            </View>
                        </Pressable>
                    )}
                    contentContainerStyle={
                        styles.projectList
                    }
                    showsVerticalScrollIndicator={false}
                    ItemSeparatorComponent={() => (
                        <View style={styles.separator} />
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
        fontWeight: '400',
        lineHeight: 28,
    },

    filterContainer: {
        flexDirection: 'row',
        marginTop: 28,
        gap: 8,
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

    projectList: {
        paddingTop: 18,
        paddingBottom: 40,
    },

    separator: {
        height: 12,
    },

    projectCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    icon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconText: {
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
        color: '#64748B',
    },

    menu: {
        fontSize: 16,
        color: '#94A3B8',
        letterSpacing: 1,
    },

    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 8,
    },

    progressLabel: {
        fontSize: 11,
        color: '#64748B',
    },

    progressValue: {
        fontSize: 11,
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

    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        marginTop: 14,
    },

    taskText: {
        flex: 1,
        fontSize: 11,
        color: '#64748B',
    },

    deadline: {
        flexShrink: 0,
        fontSize: 11,
        fontWeight: '600',
        color: '#475569',
    },

    emptyCard: {
        marginTop: 18,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
    },

    emptyText: {
        marginTop: 7,
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
        textAlign: 'center',
    },

    emptyButton: {
        marginTop: 15,
        backgroundColor: '#0F172A',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 10,
    },

    emptyButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});