import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export default function AboutScreen() {
    return (
        <SafeAreaView
            style={styles.container}
            edges={['top', 'bottom']}
        >
            {/* =========================
                HEADER
            ========================= */}

            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => router.replace('/(app)/profile')}
                >
                    <Text style={styles.backText}>
                        ‹
                    </Text>
                </Pressable>

                <Text style={styles.title}>
                    Tentang POROS
                </Text>
            </View>

            {/* =========================
                CONTENT
            ========================= */}

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* LOGO */}

                {/* ABOUT */}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Tentang Aplikasi
                    </Text>

                    <Text style={styles.cardText}>
                        POROS adalah aplikasi manajemen proyek
                        dan kolaborasi tim yang membantu pengguna
                        mengatur proyek, tugas, anggota tim, deadline,
                        serta perkembangan pekerjaan dalam satu tempat.
                    </Text>
                </View>

                {/* FEATURES */}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Fitur Utama
                    </Text>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureIconText}>
                                ✓
                            </Text>
                        </View>

                        <Text style={styles.featureText}>
                            Manajemen proyek dan anggota tim
                        </Text>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureIconText}>
                                ✓
                            </Text>
                        </View>

                        <Text style={styles.featureText}>
                            Pengelolaan dan pembagian tugas
                        </Text>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureIconText}>
                                ✓
                            </Text>
                        </View>

                        <Text style={styles.featureText}>
                            Status dan prioritas pekerjaan
                        </Text>
                    </View>

                    <View style={styles.featureRow}>
                        <View style={styles.featureIcon}>
                            <Text style={styles.featureIconText}>
                                ✓
                            </Text>
                        </View>

                        <Text style={styles.featureText}>
                            Deadline dan aktivitas proyek
                        </Text>
                    </View>
                </View>

                {/* TECHNOLOGY */}

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>
                        Teknologi
                    </Text>

                    <View style={styles.techRow}>
                        <Text style={styles.techLabel}>
                            Mobile
                        </Text>

                        <Text style={styles.techValue}>
                            React Native + Expo
                        </Text>
                    </View>

                    <View style={styles.techDivider} />

                    <View style={styles.techRow}>
                        <Text style={styles.techLabel}>
                            Backend
                        </Text>

                        <Text style={styles.techValue}>
                            Node.js + Express
                        </Text>
                    </View>

                    <View style={styles.techDivider} />

                    <View style={styles.techRow}>
                        <Text style={styles.techLabel}>
                            Database
                        </Text>

                        <Text style={styles.techValue}>
                            PostgreSQL
                        </Text>
                    </View>

                    <View style={styles.techDivider} />

                    <View style={styles.techRow}>
                        <Text style={styles.techLabel}>
                            API
                        </Text>

                        <Text style={styles.techValue}>
                            REST API
                        </Text>
                    </View>
                </View>

                {/* VERSION */}

                <View style={styles.versionBox}>
                    <Text style={styles.versionLabel}>
                        Versi Aplikasi
                    </Text>

                    <Text style={styles.version}>
                        POROS v1.0.0
                    </Text>
                </View>

                <Text style={styles.footer}>
                    © 2026 POROS
                </Text>

                <Text style={styles.footerSub}>
                    Sistem Manajemen Proyek & Kolaborasi Tim
                </Text>
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
        paddingTop: 20,
        paddingBottom: 40,
    },

    /* =========================
       LOGO
    ========================= */

    logoContainer: {
        width: 76,
        height: 76,
        borderRadius: 20,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 14,
    },

    logoText: {
        color: '#FFFFFF',
        fontSize: 38,
        fontWeight: '800',
    },

    appName: {
        fontSize: 28,
        fontWeight: '800',
        color: '#0F172A',
        textAlign: 'center',
    },

    tagline: {
        marginTop: 6,
        fontSize: 13,
        lineHeight: 19,
        color: '#64748B',
        textAlign: 'center',
        marginBottom: 28,
    },

    /* =========================
       CARD
    ========================= */

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        padding: 18,
        marginBottom: 16,
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0F172A',
        marginBottom: 12,
    },

    cardText: {
        fontSize: 13,
        lineHeight: 21,
        color: '#64748B',
    },

    /* =========================
       FEATURES
    ========================= */

    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },

    featureIcon: {
        width: 30,
        height: 30,
        borderRadius: 9,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },

    featureIconText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0F172A',
    },

    featureText: {
        flex: 1,
        fontSize: 13,
        lineHeight: 19,
        color: '#475569',
    },

    /* =========================
       TECHNOLOGY
    ========================= */

    techRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 38,
    },

    techLabel: {
        fontSize: 13,
        color: '#64748B',
    },

    techValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0F172A',
        textAlign: 'right',
        flexShrink: 1,
        marginLeft: 20,
    },

    techDivider: {
        height: 1,
        backgroundColor: '#E2E8F0',
    },

    /* =========================
       VERSION
    ========================= */

    versionBox: {
        alignItems: 'center',
        marginTop: 4,
        marginBottom: 20,
    },

    versionLabel: {
        fontSize: 12,
        color: '#94A3B8',
        marginBottom: 4,
    },

    version: {
        fontSize: 13,
        fontWeight: '700',
        color: '#475569',
    },

    /* =========================
       FOOTER
    ========================= */

    footer: {
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: '#64748B',
    },

    footerSub: {
        textAlign: 'center',
        fontSize: 11,
        color: '#94A3B8',
        marginTop: 4,
    },
});