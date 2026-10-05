import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function NotificationsScreen() {
    const [taskNotification, setTaskNotification] = useState(true);
    const [deadlineNotification, setDeadlineNotification] = useState(true);
    const [activityNotification, setActivityNotification] = useState(false);

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
                    Notifikasi
                </Text>
            </View>

            {/* =========================
                CONTENT
            ========================= */}

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* INTRO */}

                <View style={styles.intro}>

                    <Text style={styles.heading}>
                        Pengaturan Notifikasi
                    </Text>

                    <Text style={styles.description}>
                        Atur notifikasi yang ingin kamu terima dari POROS.
                    </Text>
                </View>

                {/* GENERAL */}

                <Text style={styles.sectionTitle}>
                    Notifikasi
                </Text>

                <View style={styles.card}>

                    {/* TASK */}

                    <View style={styles.settingRow}>
                        <View style={styles.settingIcon}>
                            <Text style={styles.settingIconText}>
                                ✓
                            </Text>
                        </View>

                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>
                                Notifikasi Tugas
                            </Text>

                            <Text style={styles.settingDescription}>
                                Dapatkan pemberitahuan saat ada perubahan
                                pada tugas.
                            </Text>
                        </View>

                        <Switch
                            value={taskNotification}
                            onValueChange={setTaskNotification}
                            trackColor={{
                                false: '#CBD5E1',
                                true: '#94A3B8',
                            }}
                            thumbColor={
                                taskNotification
                                    ? '#0F172A'
                                    : '#F8FAFC'
                            }
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* DEADLINE */}

                    <View style={styles.settingRow}>
                        <View style={styles.settingIcon}>
                            <Text style={styles.settingIconText}>
                                !
                            </Text>
                        </View>

                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>
                                Deadline Tugas
                            </Text>

                            <Text style={styles.settingDescription}>
                                Dapatkan pengingat ketika deadline tugas
                                sudah dekat.
                            </Text>
                        </View>

                        <Switch
                            value={deadlineNotification}
                            onValueChange={setDeadlineNotification}
                            trackColor={{
                                false: '#CBD5E1',
                                true: '#94A3B8',
                            }}
                            thumbColor={
                                deadlineNotification
                                    ? '#0F172A'
                                    : '#F8FAFC'
                            }
                        />
                    </View>

                    <View style={styles.divider} />

                    {/* ACTIVITY */}

                    <View style={styles.settingRow}>
                        <View style={styles.settingIcon}>
                            <Text style={styles.settingIconText}>
                                ↻
                            </Text>
                        </View>

                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>
                                Aktivitas Proyek
                            </Text>

                            <Text style={styles.settingDescription}>
                                Dapatkan pemberitahuan mengenai aktivitas
                                terbaru dalam proyek.
                            </Text>
                        </View>

                        <Switch
                            value={activityNotification}
                            onValueChange={setActivityNotification}
                            trackColor={{
                                false: '#CBD5E1',
                                true: '#94A3B8',
                            }}
                            thumbColor={
                                activityNotification
                                    ? '#0F172A'
                                    : '#F8FAFC'
                            }
                        />
                    </View>
                </View>

                {/* INFO */}

                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>
                        Tentang Notifikasi
                    </Text>

                    <Text style={styles.infoText}>
                        Pengaturan ini mengontrol jenis pemberitahuan
                        yang ditampilkan oleh aplikasi POROS.
                    </Text>
                </View>
            </ScrollView>
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
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 40,
    },

    /* =========================
       INTRO
    ========================= */

    intro: {
        alignItems: 'center',
        marginBottom: 30,
    },

    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    icon: {
        fontSize: 30,
        color: '#0F172A',
    },

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
       SECTION
    ========================= */

    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 10,
    },

    /* =========================
       CARD
    ========================= */

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },

    settingRow: {
        minHeight: 100,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
    },

    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },

    settingIconText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },

    settingContent: {
        flex: 1,
        paddingRight: 10,
    },

    settingTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 4,
    },

    settingDescription: {
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
    },

    divider: {
        height: 1,
        backgroundColor: '#E2E8F0',
        marginLeft: 68,
    },

    /* =========================
       INFO
    ========================= */

    infoBox: {
        marginTop: 20,
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    infoTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#334155',
        marginBottom: 6,
    },

    infoText: {
        fontSize: 12,
        lineHeight: 18,
        color: '#64748B',
    },
});