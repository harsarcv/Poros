import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { API_URL } from '../../constants/api';
import { getToken } from '../../utils/storage';

export default function ActivityScreen() {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const fetchActivities = async () => {
                try {
                    setLoading(true);

                    const token = await getToken();

                    const response = await fetch(
                        `${API_URL}/api/activity`,
                        {
                            headers: {
                                Authorization:
                                    `Bearer ${token}`,
                            },
                        }
                    );

                    const data =
                        await response.json();

                    console.log(
                        'ACTIVITY API:',
                        data
                    );

                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                                'Gagal mengambil aktivitas'
                        );
                    }

                    setActivities(data);
                } catch (error) {
                    console.error(
                        'FETCH ACTIVITY ERROR:',
                        error
                    );

                    setActivities([]);
                } finally {
                    setLoading(false);
                }
            };

            fetchActivities();
        }, [])
    );

    // ==========================================
    // FORMAT TANGGAL
    // ==========================================

    const getDateLabel = (
        dateString: string
    ) => {
        const date =
            new Date(dateString);

        const now = new Date();

        const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const yesterday =
            new Date(today);

        yesterday.setDate(
            yesterday.getDate() - 1
        );

        const activityDate =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate()
            );

        if (
            activityDate.getTime() ===
            today.getTime()
        ) {
            return 'Hari Ini';
        }

        if (
            activityDate.getTime() ===
            yesterday.getTime()
        ) {
            return 'Kemarin';
        }

        return date.toLocaleDateString(
            'id-ID',
            {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
            }
        );
    };

    // ==========================================
    // FORMAT JAM
    // ==========================================

    const getTime = (
        dateString: string
    ) => {
        return new Date(
            dateString
        ).toLocaleTimeString(
            'id-ID',
            {
                hour: '2-digit',
                minute: '2-digit',
            }
        );
    };

    // ==========================================
    // GROUP AKTIVITAS
    // ==========================================

    const groupedActivities: {
        label: string;
        items: any[];
    }[] = [];

    activities.forEach(
        (activity) => {
            const label =
                getDateLabel(
                    activity.created_at
                );

            const existingGroup =
                groupedActivities.find(
                    (group) =>
                        group.label ===
                        label
                );

            if (existingGroup) {
                existingGroup.items.push(
                    activity
                );
            } else {
                groupedActivities.push({
                    label,
                    items: [activity],
                });
            }
        }
    );

    // ==========================================
    // FLATLIST ITEM
    // ==========================================

    const renderActivityGroup = ({
        item: group,
    }: {
        item: {
            label: string;
            items: any[];
        };
    }) => {
        return (
            <View>
                <Text
                    style={
                        styles.dateTitle
                    }
                >
                    {group.label}
                </Text>

                {group.items.map(
                    (
                        activity: any
                    ) => (
                        <View
                            key={
                                activity.id
                            }
                            style={
                                styles.activityItem
                            }
                        >
                            {/* TIMELINE */}

                            <View
                                style={
                                    styles.timelineLeft
                                }
                            >
                                <View
                                    style={
                                        styles.dot
                                    }
                                />

                                <View
                                    style={
                                        styles.line
                                    }
                                />
                            </View>

                            {/* CARD */}

                            <View
                                style={
                                    styles.activityCard
                                }
                            >
                                <View
                                    style={
                                        styles.activityHeader
                                    }
                                >
                                    {/* AVATAR */}

                                    <View
                                        style={
                                            styles.avatar
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.avatarText
                                            }
                                        >
                                            {activity
                                                .user_name
                                                ?.charAt(
                                                    0
                                                )
                                                ?.toUpperCase() ||
                                                '?'}
                                        </Text>
                                    </View>

                                    {/* CONTENT */}

                                    <View
                                        style={
                                            styles.activityInfo
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.activityText
                                            }
                                        >
                                            <Text
                                                style={
                                                    styles.user
                                                }
                                            >
                                                {
                                                    activity.user_name
                                                }
                                            </Text>
                                        </Text>

                                        <Text
                                            style={
                                                styles.target
                                            }
                                        >
                                            {
                                                activity.description
                                            }
                                        </Text>

                                        {activity.project_name && (
                                            <Text
                                                style={
                                                    styles.projectText
                                                }
                                            >
                                                Proyek:{' '}
                                                {
                                                    activity.project_name
                                                }
                                            </Text>
                                        )}

                                        <Text
                                            style={
                                                styles.time
                                            }
                                        >
                                            {getTime(
                                                activity.created_at
                                            )}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )
                )}
            </View>
        );
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
                    Memuat aktivitas...
                </Text>
            </View>
        );
    }

    // ==========================================
    // EMPTY
    // ==========================================

    if (activities.length === 0) {
        return (
            <View
                style={
                    styles.container
                }
            >
                <View
                    style={
                        styles.header
                    }
                >
                    <Text
                        style={
                            styles.title
                        }
                    >
                        Aktivitas
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Riwayat aktivitas dalam proyek kamu.
                    </Text>
                </View>

                <View
                    style={
                        styles.emptyContainer
                    }
                >
                    <Text
                        style={
                            styles.emptyText
                        }
                    >
                        Belum ada aktivitas.
                    </Text>
                </View>
            </View>
        );
    }

    // ==========================================
    // MAIN
    // ==========================================

    return (
        <View
            style={
                styles.container
            }
        >
            {/* HEADER */}

            <View
                style={
                    styles.header
                }
            >
                <Text
                    style={
                        styles.title
                    }
                >
                    Aktivitas
                </Text>

                <Text
                    style={
                        styles.subtitle
                    }
                >
                    Riwayat aktivitas dalam proyek kamu.
                </Text>
            </View>

            {/* ACTIVITY LIST */}

            <FlatList
                data={
                    groupedActivities
                }
                keyExtractor={(
                    item,
                    index
                ) =>
                    `${item.label}-${index}`
                }
                renderItem={
                    renderActivityGroup
                }
                style={
                    styles.list
                }
                contentContainerStyle={
                    styles.timeline
                }
                showsVerticalScrollIndicator={
                    false
                }
            />
        </View>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                '#F8FAFC',
        },

        header: {
            paddingHorizontal: 24,
            paddingTop: 60,
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

        list: {
            flex: 1,
        },

        timeline: {
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 40,
        },

        loadingContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
                '#F8FAFC',
        },

        loadingText: {
            marginTop: 10,
            fontSize: 13,
            color: '#64748B',
        },

        emptyContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 24,
        },

        emptyText: {
            fontSize: 13,
            color: '#64748B',
            textAlign: 'center',
        },

        dateTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: '#0F172A',
            marginBottom: 14,
            marginTop: 8,
        },

        activityItem: {
            flexDirection: 'row',
            marginBottom: 4,
        },

        timelineLeft: {
            width: 22,
            alignItems: 'center',
        },

        dot: {
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor:
                '#0F172A',
            marginTop: 20,
        },

        line: {
            width: 1,
            flex: 1,
            backgroundColor:
                '#CBD5E1',
            marginTop: 4,
        },

        activityCard: {
            flex: 1,
            backgroundColor:
                '#FFFFFF',
            borderRadius: 14,
            padding: 14,
            marginBottom: 10,
            marginLeft: 8,
            borderWidth: 1,
            borderColor:
                '#E2E8F0',
        },

        activityHeader: {
            flexDirection: 'row',
            alignItems:
                'flex-start',
        },

        avatar: {
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor:
                '#E2E8F0',
            alignItems: 'center',
            justifyContent:
                'center',
        },

        avatarText: {
            fontSize: 13,
            fontWeight: '700',
            color: '#334155',
        },

        activityInfo: {
            flex: 1,
            marginLeft: 11,
        },

        activityText: {
            fontSize: 12,
            lineHeight: 18,
            color: '#475569',
        },

        user: {
            fontWeight: '700',
            color: '#0F172A',
        },

        target: {
            marginTop: 3,
            fontSize: 13,
            fontWeight: '600',
            color: '#0F172A',
            lineHeight: 19,
        },

        projectText: {
            marginTop: 4,
            fontSize: 11,
            color: '#64748B',
        },

        time: {
            marginTop: 5,
            fontSize: 10,
            color: '#94A3B8',
        },
    });