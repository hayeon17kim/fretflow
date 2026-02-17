import * as Notifications from 'expo-notifications';

export function useNotificationPermissions() {
  const requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return { status: finalStatus };
  };

  return { requestPermissions };
}
