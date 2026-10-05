import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'poros_token';
const USER_KEY = 'poros_user';

export const saveSession = async (
  token: string,
  user: object
) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getToken = async () => {
  return await AsyncStorage.getItem(TOKEN_KEY);
};

export const debugSession = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const user = await AsyncStorage.getItem(USER_KEY);

  console.log('=== SESSION DEBUG ===');
  console.log('TOKEN:', token ? 'ADA' : 'TIDAK ADA');
  console.log('USER:', user ? user : 'TIDAK ADA');
};

export const getUser = async () => {
  const user = await AsyncStorage.getItem(USER_KEY);

  return user ? JSON.parse(user) : null;
};

export const clearSession = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
};