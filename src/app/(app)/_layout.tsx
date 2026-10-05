import { Tabs, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
} from 'react-native';

import {
  getToken,
  getUser,
} from '../../utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppLayout() {
  const insets = useSafeAreaInsets();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      const currentUser = await getUser();

      console.log(
        'TOKEN POROS:',
        token ? 'ADA' : 'NULL'
      );

      console.log(
        'USER POROS:',
        currentUser
      );

      if (!token) {
        router.replace('/login');
        return;
      }

      setUser(currentUser);
      setCheckingAuth(false);
    };

    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F8FAFC',
        }}
      >
        <ActivityIndicator
          size="large"
          color="#0F172A"
        />
      </View>
    );
  }

  const role = String(
    user?.role || ''
  ).toUpperCase();

  const isMember = role === 'MEMBER';

  const isManager =
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'ADMIN/MANAGER';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: '#111827',
        tabBarInactiveTintColor: '#94A3B8',

        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 8,
          borderTopColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="home-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="projects"
        options={{
          title: 'Proyek',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="folder-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="my-tasks"
        options={{
          title: 'Tugas Saya',
          href: isMember ? '/(app)/my-tasks' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="checkmark-circle-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tugas',
          href: isManager ? '/(app)/tasks' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="list-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="activity"
        options={{
          title: 'Aktivitas',
          href: isManager ? '/(app)/activity' : null,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="time-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="project-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="task-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="create-project"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="create-task"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="security"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          href: null,
          tabBarStyle: {
            display: 'none',
          },
        }}
      />
    </Tabs>
  );
}