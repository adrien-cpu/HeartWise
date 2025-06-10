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
  
  try {
    return await Notification.requestPermission();
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
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
    try {
      new Notification(title, options);
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        new Notification(title, options);
      } catch (error) {
        console.error('Error showing notification after permission granted:', error);
      }
    } else {
      console.log('Notification permission denied by user.');
    }
  } else {
    console.log('Notification permission already denied.');
  }
}

/**
 * Schedules a notification to be shown after a delay.
 * @function scheduleNotification
 * @param {string} title - The title of the notification.
 * @param {NotificationOptions} options - Notification options.
 * @param {number} delayMs - Delay in milliseconds before showing the notification.
 * @returns {Promise<number>} A timeout ID that can be used to cancel the scheduled notification.
 */
export async function scheduleNotification(
  title: string, 
  options: NotificationOptions, 
  delayMs: number
): Promise<number> {
  return window.setTimeout(() => {
    showNotification(title, options);
  }, delayMs);
}

/**
 * Cancels a scheduled notification.
 * @function cancelScheduledNotification
 * @param {number} timeoutId - The timeout ID returned by scheduleNotification.
 */
export function cancelScheduledNotification(timeoutId: number): void {
  window.clearTimeout(timeoutId);
}