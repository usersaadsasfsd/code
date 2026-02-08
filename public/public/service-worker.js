// public/sw.js
// Service Worker for Push Notifications

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  // event.waitUntil(self.clients.claim()); // You might uncomment this if you want the service worker to immediately control all clients
  console.log('Service Worker activated (without claiming clients).');
});

self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);

  let notificationData = {
    title: 'RealEstate CRM',
    body: 'You have a new notification',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'realestate-crm',
    data: {},
  };

  if (event.data) {
    try {
      // Parse the full payload sent from the server
      const payloadFromServer = event.data.json();
      console.log('Service Worker: Parsed payload from server:', payloadFromServer);

      // Extract the 'notification' and 'data' objects from the payload
      const notificationContent = payloadFromServer.notification || {};
      const customData = payloadFromServer.data || {};

      notificationData = {
        ...notificationData,
        title: notificationContent.title || notificationData.title,
        body: notificationContent.body || notificationData.body, // Access body from notificationContent
        icon: notificationContent.icon || notificationData.icon,
        badge: notificationContent.badge || notificationData.badge,
        tag: notificationContent.tag || notificationData.tag,
        data: customData, // Assign the custom data for use in notificationclick
      };
    } catch (error) {
      console.error('Error parsing push notification data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data, // This 'data' object will be available in notificationclick
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.png',
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.png',
      },
    ],
    requireInteraction: true,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      let isAppInForeground = false;
      for (const client of clientList) {
        if (client.visibilityState === 'visible' && client.focused) {
          isAppInForeground = true;
          console.log('Service Worker: App is in foreground, posting message to client.');
          client.postMessage({
            type: 'PUSH_NOTIFICATION',
            payload: {
              notification: {
                title: notificationData.title,
                body: notificationData.body,
                icon: notificationData.icon,
                tag: notificationData.tag,
              },
              data: notificationData.data,
            },
          });
          break;
        }
      }

      if (!isAppInForeground) {
        console.log('Service Worker: App is not in foreground, showing system notification.');
        return self.registration.showNotification(notificationData.title, options);
      }
    }).catch(error => {
      console.error('Service Worker: Error in push event handler:', error);
      // Fallback: show notification if there's an error matching clients
      return self.registration.showNotification(notificationData.title, options);
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Default action or 'view' action
  // Access data directly from event.notification.data
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  // Track notification dismissal if needed
});
