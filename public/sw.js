self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "Coachmii-fit", body: event.data.text() };
  }
  const { title, body, url, tag } = payload;
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-96.png",
      tag: tag ?? "coachmii",
      data: { url: url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((all) => {
      const match = all.find((c) => c.url.includes(self.location.origin) && "focus" in c);
      if (match) return match.focus().then((c) => c.navigate(url));
      return clients.openWindow(url);
    }),
  );
});
