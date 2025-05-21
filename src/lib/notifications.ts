/**
 * @fileOverview Provides helper functions for displaying local browser notifications.
 * @module NotificationUtils
 */

/**
 * Requests permission to show notifications.
 * @async
 * @function requestNotificationPermission
 * @returns {Promise<NotificationPermission>} The permission status ('granted', 'denied', 'default').
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return 'denied';
  }
  return Notification.requestPermission();
}

/**
 * Displays a local browser notification.
 * Checks for permission before attempting to show.
 * @function showNotification
 * @param {string} title - The title of the notification.
 * @param {NotificationOptions} [options] - Optional notification options (body, icon, etc.).
 * @returns {Promise<void>}
 */
export async function showNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notification');
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, options);
    } else {
        console.log('Notification permission denied by user.');
    }
  } else {
     console.log('Notification permission already denied.');
  }
}
