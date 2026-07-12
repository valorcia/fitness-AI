// Coachmii-fit service worker — handles Web Push notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = { title: "Coachmii-fit", body: event.data.text() };
  }

  const { title, body, icon, badge, tag, url } = data;

  event.waitUntil(
    self.registration.showNotification(title ?? "Coachmii-fit", {
      body: body ?? "",
      icon: icon ?? "/icons/icon-192.png",
      badge: badge ?? "/icons/badge-72.png",
      tag: tag ?? "default",
      data: { url: url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        for (const client of windowClients) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        if (clients.openWindow) return clients.openWindow(url);
      }),
  );
});
