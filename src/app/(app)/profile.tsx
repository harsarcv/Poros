import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    ActivityIndicator,
    Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { clearSession, getToken } from '../../utils/storage';
import { API_URL } from '../../constants/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            const loadUser = async () => {
                try {
                    setLoading(true);

                    const token = await getToken();

                    if (!token) {
                        router.replace('/login');
                        return;
                    }

                    const response = await fetch(`${API_URL}/api/users/me`, {
                        method: 'GET',
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        throw new Error(data.message || 'Gagal mengambil profil');
                    }

                    console.log('PROFILE API:', data);

                    setUser(data);
                } catch (error) {
                    console.error('LOAD PROFILE ERROR:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadUser();
        }, [])
    );

    const handleLogout = async () => {
        await clearSession();

        router.replace('/login');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" />

                <Text style={styles.loadingText}>
                    Memuat profil...
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
            <Text style={styles.title}>
                Profil
            </Text>

            <Text style={styles.subtitle}>
                Kelola informasi akun dan pengaturan kamu.
            </Text>

            {/* PROFILE CARD */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    {user?.profile_image ? (
                        <Image
                            source={{
                                uri: `${API_URL}${user.profile_image}`,
                            }}
                            style={styles.avatarImage}
                        />
                    ) : (
                        <Text style={styles.avatarText}>
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </Text>
                    )}
                </View>

                <View style={styles.profileInfo}>
                    <Text style={styles.name}>
                        {user?.name || 'Pengguna'}
                    </Text>

                    <Text style={styles.email}>
                        {user?.email || '-'}
                    </Text>

                    <View style={styles.roleBadge}>
                        <Text style={styles.roleText}>
                            {user?.role || 'MEMBER'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* AKUN */}
            <Text style={styles.sectionTitle}>
                Akun
            </Text>

            <View style={styles.menuCard}>
                <Pressable
                    style={styles.menuItem}
                    onPress={() =>
                        router.push('/(app)/edit-profile')
                    }
                >
                    <View style={styles.menuIcon}>
                        <Ionicons
                            name="person-outline"
                            size={21}
                            color="#475569"
                        />
                    </View>

                    <View style={styles.menuInfo}>
                        <Text style={styles.menuTitle}>
                            Edit Profil
                        </Text>

                        <Text style={styles.menuSubtitle}>
                            Ubah nama dan informasi akun
                        </Text>
                    </View>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable
                    style={styles.menuItem}
                    onPress={() => router.push('/(app)/security')}
                >
                    <View style={styles.menuIcon}>
                        <Ionicons
                            name="lock-closed-outline"
                            size={21}
                            color="#475569"
                        />
                    </View>

                    <View style={styles.menuInfo}>
                        <Text style={styles.menuTitle}>
                            Keamanan
                        </Text>

                        <Text style={styles.menuSubtitle}>
                            Kelola kata sandi akun
                        </Text>
                    </View>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </Pressable>
            </View>

            {/* PENGATURAN */}
            <Text style={styles.sectionTitle}>
                Pengaturan
            </Text>

            <View style={styles.menuCard}>
                <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/notifications')}>
                    <View style={styles.menuIcon}>
                        <Ionicons
                            name="notifications-outline"
                            size={21}
                            color="#475569"
                        />
                    </View>

                    <View style={styles.menuInfo}>
                        <Text style={styles.menuTitle}>
                            Notifikasi
                        </Text>

                        <Text style={styles.menuSubtitle}>
                            Pengaturan notifikasi aplikasi
                        </Text>
                    </View>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </Pressable>

                <View style={styles.divider} />

                <Pressable style={styles.menuItem} onPress={() => router.push('/(app)/about')}>
                    <View style={styles.menuIcon}>
                        <Ionicons
                            name="information-circle-outline"
                            size={21}
                            color="#475569"
                        />
                    </View>

                    <View style={styles.menuInfo}>
                        <Text style={styles.menuTitle}>
                            Tentang POROS
                        </Text>

                        <Text style={styles.menuSubtitle}>
                            Informasi aplikasi
                        </Text>
                    </View>

                    <Text style={styles.arrow}>
                        ›
                    </Text>
                </Pressable>
            </View>

            {/* LOGOUT */}
            <Pressable
                style={styles.logoutButton}
                onPress={handleLogout}
            >
                <Text style={styles.logoutText}>
                    Keluar
                </Text>
            </Pressable>

            <Text style={styles.version}>
                POROS v1.0.0
            </Text>
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

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        marginTop: 24,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },

    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#0F172A',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    profileInfo: {
        flex: 1,
        marginLeft: 16,
    },

    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#0F172A',
    },

    email: {
        marginTop: 4,
        fontSize: 12,
        color: '#64748B',
    },

    roleBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 9,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 8,
    },

    roleText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#475569',
    },

    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#0F172A',
        marginTop: 28,
        marginBottom: 12,
    },

    menuCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        overflow: 'hidden',
    },

    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },

    menuIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    menuIconText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },

    menuInfo: {
        flex: 1,
        marginLeft: 12,
    },

    menuTitle: {
        fontSize: 13,
        fontWeight: '700',
        color: '#0F172A',
    },

    menuSubtitle: {
        marginTop: 3,
        fontSize: 11,
        color: '#64748B',
    },

    arrow: {
        fontSize: 24,
        color: '#94A3B8',
    },

    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 66,
    },

    logoutButton: {
        marginTop: 28,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },

    logoutText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#DC2626',
    },

    version: {
        textAlign: 'center',
        marginTop: 18,
        fontSize: 11,
        color: '#94A3B8',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
    },
});