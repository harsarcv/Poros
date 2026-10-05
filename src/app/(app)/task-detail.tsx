import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { useCallback, useState } from 'react';

import { API_URL } from '../../constants/api';

import {
  getToken,
  getUser,
} from '../../utils/storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskDetail() {
  const { id, from } = useLocalSearchParams();

  const [task, setTask] = useState<any>(null);
  const [status, setStatus] = useState('TODO');
  const [user, setUser] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [revisionModalVisible, setRevisionModalVisible] =
    useState(false);

  const [revisionNote, setRevisionNote] = useState('');
  const [sendingRevision, setSendingRevision] =
    useState(false);

  console.log('TASK DETAIL ID:', id);
  console.log('TASK DETAIL FROM:', from);

  // =========================
  // FUNGSI KEMBALI
  // =========================

  const handleBack = () => {
    const role = String(
      user?.role || ''
    ).toUpperCase();

    const isMember = role === 'MEMBER';

    // Member tidak boleh masuk halaman Tugas
    if (isMember) {
      router.replace('/(app)/my-tasks');
      return;
    }

    // Admin / Manager
    if (from === 'my-tasks') {
      router.replace('/(app)/my-tasks');
      return;
    }

    router.replace('/(app)/tasks');
  };

  // =========================
  // FETCH DETAIL TUGAS
  // =========================

  const fetchTask = async () => {
    try {
      setLoading(true);

      const token = await getToken();
      const currentUser = await getUser();

      setUser(currentUser);

      const response = await fetch(
        `${API_URL}/api/tasks/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log(
        'TASK DETAIL DATA:',
        data
      );

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Gagal mengambil detail tugas'
        );
      }

      setTask(data);
      setStatus(data.status);
    } catch (error) {
      console.error(
        'FETCH TASK DETAIL ERROR:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        fetchTask();
      }
    }, [id])
  );

  // =========================
  // ROLE
  // =========================

  const role = String(
    user?.role || ''
  ).toUpperCase();

  const isManager =
    role === 'ADMIN' ||
    role === 'MANAGER' ||
    role === 'ADMIN/MANAGER';

  const isMember =
    role === 'MEMBER';

  const isAssignedToCurrentUser =
    Number(task?.assigned_to) ===
    Number(user?.id);

  const canChangeStatus =
    isManager ||
    (isMember &&
      isAssignedToCurrentUser);

  // =========================
  // UPDATE STATUS
  // =========================

  const updateStatus = async (
    newStatus: string
  ) => {
    if (!canChangeStatus) {
      Alert.alert(
        'Akses Ditolak',
        'Kamu hanya dapat mengubah status tugas yang ditugaskan kepadamu.'
      );

      return;
    }

    try {
      setUpdatingStatus(true);

      const token =
        await getToken();

      const response =
        await fetch(
          `${API_URL}/api/tasks/${id}/status`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              status: newStatus,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Gagal mengubah status'
        );
      }

      setStatus(newStatus);

      setTask((prev: any) => ({
        ...prev,
        status: newStatus,
      }));

    } catch (error) {
      console.error(
        'UPDATE STATUS ERROR:',
        error
      );

      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Tidak dapat mengubah status tugas.'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // =========================
  // REQUEST REVISION
  // ADMIN / MANAGER
  // =========================

  const requestRevision = async () => {
    if (!revisionNote.trim()) {
      Alert.alert(
        'Catatan Revisi',
        'Catatan revisi wajib diisi.'
      );

      return;
    }

    try {
      setSendingRevision(true);

      const token =
        await getToken();

      const response =
        await fetch(
          `${API_URL}/api/tasks/${id}/revision`,
          {
            method: 'PATCH',

            headers: {
              'Content-Type':
                'application/json',

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              revision_note:
                revisionNote.trim(),
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Gagal mengirim revisi'
        );
      }

      setStatus('REVISI');

      setTask((prev: any) => ({
        ...prev,
        status: 'REVISI',
        revision_note:
          revisionNote.trim(),
      }));

      setRevisionNote('');
      setRevisionModalVisible(false);

      Alert.alert(
        'Berhasil',
        'Catatan revisi berhasil dikirim kepada Member.'
      );

    } catch (error) {
      console.error(
        'REQUEST REVISION ERROR:',
        error
      );

      Alert.alert(
        'Gagal',
        error instanceof Error
          ? error.message
          : 'Gagal mengirim revisi.'
      );
    } finally {
      setSendingRevision(false);
    }
  };

  // =========================
  // DELETE TASK
  // =========================

  const deleteTask = () => {
    if (!isManager) {
      Alert.alert(
        'Akses Ditolak',
        'Kamu tidak memiliki akses untuk menghapus tugas.'
      );

      return;
    }

    Alert.alert(
      'Hapus Tugas',
      `Apakah kamu yakin ingin menghapus tugas "${task?.title}"?`,
      [
        {
          text: 'Batal',
          style: 'cancel',
        },

        {
          text: 'Hapus',
          style: 'destructive',

          onPress:
            confirmDeleteTask,
        },
      ]
    );
  };

  const confirmDeleteTask =
    async () => {
      try {
        setDeleting(true);

        const token =
          await getToken();

        const response =
          await fetch(
            `${API_URL}/api/tasks/${id}`,
            {
              method: 'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Gagal menghapus tugas'
          );
        }

        Alert.alert(
          'Berhasil',
          'Tugas berhasil dihapus.',
          [
            {
              text: 'OK',

              onPress: () => {
                if (
                  from ===
                  'my-tasks'
                ) {
                  router.replace(
                    '/(app)/my-tasks'
                  );
                } else {
                  router.replace(
                    '/(app)/tasks'
                  );
                }
              },
            },
          ]
        );

      } catch (error) {
        console.error(
          'DELETE TASK ERROR:',
          error
        );

        Alert.alert(
          'Gagal',
          'Tidak dapat menghapus tugas. Silakan coba lagi.'
        );
      } finally {
        setDeleting(false);
      }
    };

  // =========================
  // LOADING
  // =========================

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
          Memuat detail tugas...
        </Text>
      </View>
    );
  }

  // =========================
  // TASK TIDAK DITEMUKAN
  // =========================

  if (!task) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.errorText
          }
        >
          Data tugas tidak ditemukan.
        </Text>

        <Pressable
          style={
            styles.backButton
          }
          onPress={handleBack}
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            {from === 'my-tasks'
              ? 'Kembali ke Tugas Saya'
              : 'Kembali ke Tugas'}
          </Text>
        </Pressable>
      </View>
    );
  }

  // =========================
  // FORMAT DEADLINE
  // =========================

  const formatDeadline = (
    date: string | null
  ) => {
    if (!date) {
      return 'Tidak ada deadline';
    }

    const d = new Date(date);

    return d.toLocaleDateString(
      'id-ID',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  // =========================
  // FORMAT PRIORITY
  // =========================

  const formatPriority = (
    priority: string
  ) => {
    if (
      priority === 'HIGH' ||
      priority === 'TINGGI'
    ) {
      return 'Tinggi';
    }

    if (
      priority === 'MEDIUM' ||
      priority === 'SEDANG'
    ) {
      return 'Sedang';
    }

    if (
      priority === 'LOW' ||
      priority === 'RENDAH'
    ) {
      return 'Rendah';
    }

    return priority;
  };

  // =========================
  // TAMPILAN AKSI MEMBER
  // =========================

  const renderMemberAction = () => {
    if (
      !isMember ||
      !isAssignedToCurrentUser
    ) {
      return null;
    }

    if (status === 'TODO') {
      return (
        <Pressable
          style={
            styles.primaryButton
          }
          disabled={
            updatingStatus
          }
          onPress={() =>
            updateStatus(
              'IN PROGRESS'
            )
          }
        >
          {updatingStatus ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Mulai Tugas
            </Text>
          )}
        </Pressable>
      );
    }

    if (
      status ===
      'IN PROGRESS'
    ) {
      return (
        <Pressable
          style={
            styles.primaryButton
          }
          disabled={
            updatingStatus
          }
          onPress={() =>
            updateStatus(
              'REVIEW'
            )
          }
        >
          {updatingStatus ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Kirim untuk Review
            </Text>
          )}
        </Pressable>
      );
    }

    if (
      status === 'REVISI'
    ) {
      return (
        <Pressable
          style={
            styles.primaryButton
          }
          disabled={
            updatingStatus
          }
          onPress={() =>
            updateStatus(
              'IN PROGRESS'
            )
          }
        >
          {updatingStatus ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Terima Revisi
            </Text>
          )}
        </Pressable>
      );
    }

    return null;
  };

  // =========================
  // TAMPILAN AKSI MANAGER
  // =========================

  const renderManagerActions = () => {
    if (
      !isManager ||
      status !== 'REVIEW'
    ) {
      return null;
    }

    return (
      <View
        style={
          styles.managerActions
        }
      >
        <Pressable
          style={
            styles.approveButton
          }
          disabled={
            updatingStatus
          }
          onPress={() =>
            updateStatus(
              'DONE'
            )
          }
        >
          {updatingStatus ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <Text
              style={
                styles.approveButtonText
              }
            >
              Setujui
            </Text>
          )}
        </Pressable>

        <Pressable
          style={
            styles.revisionButton
          }
          onPress={() =>
            setRevisionModalVisible(
              true
            )
          }
        >
          <Text
            style={
              styles.revisionButtonText
            }
          >
            Minta Revisi
          </Text>
        </Pressable>
      </View>
    );
  };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['bottom']}
        >

      {/* HEADER */}

      <View
        style={styles.header}
      >
        <Pressable
          onPress={handleBack}
        >
          <Text
            style={styles.back}
          >
            ‹
          </Text>
        </Pressable>

        <View>
          <Text
            style={
              styles.headerTitle
            }
          >
            Detail Tugas
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Informasi tugas
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* DETAIL CARD */}

        <View
          style={styles.card}
        >
          <View
            style={styles.topRow}
          >
            <View
              style={
                styles.titleContainer
              }
            >
              <Text
                style={styles.title}
              >
                {task.title}
              </Text>

              <Text
                style={styles.project}
              >
                {task.project_name ||
                  'Tanpa proyek'}
              </Text>
            </View>
          </View>

          <View
            style={styles.divider}
          />

          {/* DESKRIPSI */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Deskripsi
          </Text>

          <Text
            style={
              styles.description
            }
          >
            {task.description ||
              'Tidak ada deskripsi tugas.'}
          </Text>

          {/* INFORMASI */}

          <Text
            style={
              styles.sectionTitle
            }
          >
            Informasi Tugas
          </Text>

          {/* STATUS */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.label}
            >
              Status
            </Text>

            <View
              style={
                styles.statusBadge
              }
            >
              <Text
                style={
                  styles.statusText
                }
              >
                {status}
              </Text>
            </View>
          </View>

          {/* PRIORITY */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.label}
            >
              Prioritas
            </Text>

            <Text
              style={styles.value}
            >
              {formatPriority(
                task.priority
              )}
            </Text>
          </View>

          {/* DEADLINE */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.label}
            >
              Deadline
            </Text>

            <Text
              style={styles.value}
            >
              {formatDeadline(
                task.deadline
              )}
            </Text>
          </View>

          {/* ASSIGNED */}

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.label}
            >
              Ditugaskan kepada
            </Text>

            <Text
              style={styles.value}
            >
              {task.assigned_name ||
                'Belum ditugaskan'}
            </Text>
          </View>
        </View>

        {/* CATATAN REVISI */}

        {status === 'REVISI' &&
          task.revision_note && (
            <View
              style={
                styles.revisionInfoBox
              }
            >
              <Text
                style={
                  styles.revisionInfoTitle
                }
              >
                Catatan Revisi
              </Text>

              <Text
                style={
                  styles.revisionInfoText
                }
              >
                {task.revision_note}
              </Text>
            </View>
          )}

        {/* AKSI MEMBER */}

        {renderMemberAction()}

        {/* INFO REVIEW */}

        {isMember &&
          isAssignedToCurrentUser &&
          status === 'REVIEW' && (
            <View
              style={
                styles.infoBox
              }
            >
              <Text
                style={
                  styles.infoBoxTitle
                }
              >
                Menunggu Review
              </Text>

              <Text
                style={
                  styles.infoBoxText
                }
              >
                Tugas sudah dikirim untuk
                diperiksa oleh Admin/Manager.
              </Text>
            </View>
          )}

        {/* AKSI MANAGER */}

        {renderManagerActions()}

        {/* INFO UNTUK MEMBER LAIN */}

        {isMember &&
          !isAssignedToCurrentUser && (
            <View
              style={
                styles.permissionBox
              }
            >
              <Text
                style={
                  styles.permissionTitle
                }
              >
                Status tugas
              </Text>

              <Text
                style={
                  styles.permissionText
                }
              >
                Tugas ini tidak ditugaskan
                kepadamu. Kamu dapat melihat
                detail tugas, tetapi tidak dapat
                mengubah statusnya.
              </Text>
            </View>
          )}

        {/* EDIT - ADMIN / MANAGER SAJA */}

        {isManager && (
          <Pressable
            style={
              styles.editButton
            }
            onPress={() =>
              router.push({
                pathname:
                  '/(app)/create-task',
                params: {
                  id: String(id),
                },
              })
            }
          >
            <Text
              style={
                styles.editButtonText
              }
            >
              Edit Tugas
            </Text>
          </Pressable>
        )}

        {/* DELETE - ADMIN / MANAGER SAJA */}

        {isManager && (
          <Pressable
            style={[
              styles.deleteButton,
              deleting &&
              styles.deleteButtonDisabled,
            ]}
            disabled={deleting}
            onPress={deleteTask}
          >
            {deleting ? (
              <ActivityIndicator
                size="small"
                color="#DC2626"
              />
            ) : (
              <Text
                style={
                  styles.deleteButtonText
                }
              >
                Hapus Tugas
              </Text>
            )}
          </Pressable>
        )}

      </ScrollView>

      {/* MODAL MINTA REVISI */}

      <Modal
        visible={
          revisionModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!sendingRevision) {
            setRevisionModalVisible(
              false
            );
          }
        }}
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={styles.modalCard}
          >
            <Text
              style={
                styles.modalTitle
              }
            >
              Minta Revisi
            </Text>

            <Text
              style={
                styles.modalDescription
              }
            >
              Jelaskan bagian yang perlu
              diperbaiki oleh Member.
            </Text>

            <TextInput
              value={revisionNote}
              onChangeText={
                setRevisionNote
              }
              placeholder="Contoh: Tolong perbaiki bagian laporan dan tambahkan screenshot hasil testing."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              style={
                styles.revisionInput
              }
              editable={
                !sendingRevision
              }
            />

            <View
              style={
                styles.modalActions
              }
            >
              <Pressable
                style={
                  styles.modalCancelButton
                }
                disabled={
                  sendingRevision
                }
                onPress={() => {
                  setRevisionNote('');
                  setRevisionModalVisible(
                    false
                  );
                }}
              >
                <Text
                  style={
                    styles.modalCancelText
                  }
                >
                  Batal
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.modalSubmitButton
                }
                disabled={
                  sendingRevision
                }
                onPress={
                  requestRevision
                }
              >
                {sendingRevision ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <Text
                    style={
                      styles.modalSubmitText
                    }
                  >
                    Kirim Revisi
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#F8FAFC',
    },

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#F8FAFC',
      padding: 20,
    },

    loadingText: {
      marginTop: 10,
      color: '#64748B',
    },

    errorText: {
      fontSize: 16,
      color: '#64748B',
      marginBottom: 16,
    },

    backButton: {
      backgroundColor:
        '#111827',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 10,
    },

    backButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 20,
      paddingTop: 55,
      paddingBottom: 18,
      backgroundColor:
        '#FFFFFF',
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
      paddingBottom: 50,
    },

    card: {
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      padding: 18,
      marginBottom: 18,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    titleContainer: {
      flex: 1,
    },

    title: {
      fontSize: 18,
      fontWeight: '700',
      color: '#111827',
    },

    project: {
      marginTop: 4,
      fontSize: 13,
      color: '#64748B',
    },

    divider: {
      height: 1,
      backgroundColor:
        '#E2E8F0',
      marginVertical: 20,
    },

    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 12,
    },

    description: {
      fontSize: 13,
      lineHeight: 20,
      color: '#64748B',
      marginBottom: 24,
    },

    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      paddingVertical: 11,
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F9',
    },

    label: {
      fontSize: 13,
      color: '#64748B',
      flex: 1,
    },

    value: {
      fontSize: 13,
      fontWeight: '600',
      color: '#111827',
      textAlign: 'right',
      maxWidth: '55%',
    },

    statusBadge: {
      backgroundColor:
        '#FEF3C7',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },

    statusText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#B45309',
    },

    // =========================
    // MEMBER ACTION
    // =========================

    primaryButton: {
      backgroundColor:
        '#111827',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
      marginBottom: 18,
    },

    primaryButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    // =========================
    // MANAGER ACTION
    // =========================

    managerActions: {
      gap: 10,
      marginBottom: 18,
    },

    approveButton: {
      backgroundColor:
        '#111827',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },

    approveButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    revisionButton: {
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#CBD5E1',
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: 'center',
    },

    revisionButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#334155',
    },

    // =========================
    // REVISION INFO
    // =========================

    revisionInfoBox: {
      backgroundColor:
        '#FFF7ED',
      borderWidth: 1,
      borderColor:
        '#FED7AA',
      borderRadius: 12,
      padding: 15,
      marginBottom: 18,
    },

    revisionInfoTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#9A3412',
      marginBottom: 6,
    },

    revisionInfoText: {
      fontSize: 13,
      lineHeight: 20,
      color: '#7C2D12',
    },

    infoBox: {
      backgroundColor:
        '#F1F5F9',
      borderRadius: 12,
      padding: 15,
      marginBottom: 18,
    },

    infoBoxTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#334155',
      marginBottom: 5,
    },

    infoBoxText: {
      fontSize: 12,
      lineHeight: 18,
      color: '#64748B',
    },

    permissionBox: {
      backgroundColor:
        '#F1F5F9',
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
    },

    permissionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#334155',
      marginBottom: 5,
    },

    permissionText: {
      fontSize: 12,
      lineHeight: 18,
      color: '#64748B',
    },

    // =========================
    // EDIT / DELETE
    // =========================

    editButton: {
      backgroundColor:
        '#111827',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 10,
    },

    editButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },

    deleteButton: {
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        '#FECACA',
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },

    deleteButtonDisabled: {
      opacity: 0.6,
    },

    deleteButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#DC2626',
    },

    // =========================
    // MODAL
    // =========================

    modalOverlay: {
      flex: 1,
      backgroundColor:
        'rgba(0, 0, 0, 0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },

    modalCard: {
      width: '100%',
      backgroundColor:
        '#FFFFFF',
      borderRadius: 18,
      padding: 20,
    },

    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      marginBottom: 8,
    },

    modalDescription: {
      fontSize: 13,
      lineHeight: 19,
      color: '#64748B',
      marginBottom: 15,
    },

    revisionInput: {
      minHeight: 120,
      borderWidth: 1,
      borderColor:
        '#CBD5E1',
      borderRadius: 12,
      padding: 14,
      fontSize: 13,
      color: '#111827',
      marginBottom: 15,
    },

    modalActions: {
      flexDirection: 'row',
      gap: 10,
    },

    modalCancelButton: {
      flex: 1,
      borderWidth: 1,
      borderColor:
        '#CBD5E1',
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
    },

    modalCancelText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#475569',
    },

    modalSubmitButton: {
      flex: 1,
      backgroundColor:
        '#111827',
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: 'center',
    },

    modalSubmitText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });