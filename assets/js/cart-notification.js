(function ($) {
  "use strict";

  $(document).ready(function () {
    if (typeof cartNotificationData === "undefined") {
      return;
    }

    if (cartNotificationData.enabled !== "1") {
      return;
    }

    if (window.location.pathname.includes("/cart")) {
      return;
    }

    // Closing a reminder silences both reminders for a day, so a reload does
    // not bring back the toast the visitor just dismissed.
    function isDismissed() {
      const match = document.cookie.match(
        new RegExp("(?:^|; )" + cartNotificationData.dismissCookie + "=(\\d+)"),
      );

      return (
        !!match &&
        Date.now() - parseInt(match[1], 10) * 1000 <
          cartNotificationData.dismissMs
      );
    }

    function markDismissed() {
      document.cookie =
        cartNotificationData.dismissCookie +
        "=" +
        Math.floor(Date.now() / 1000) +
        "; path=/; max-age=" +
        Math.floor(cartNotificationData.dismissMs / 1000) +
        "; SameSite=Lax";
    }

    function showCartNotification() {
      const link = document.createElement("a");
      link.href = cartNotificationData.cartUrl;
      link.textContent = "Перейти в корзину";
      link.className = "cn-toast__action";
      link.addEventListener("click", function (event) {
        event.stopPropagation();
      });

      const text = document.createElement("p");
      text.className = "cn-toast__text";
      text.textContent = cartNotificationData.notificationText;

      const content = document.createElement("div");
      content.className = "cn-toast";
      content.append(text, link);

      Toastify({
        node: content,
        duration: -1,
        gravity: "top",
        position: "right",
        close: true,
        style: {
          background: "rgba(0, 0, 0, 0.75)",
          borderRadius: "7px",
          padding: "12px 48px 12px 20px",
        },
        onClick: function () {
          window.location.href = cartNotificationData.cartUrl;
        },
        callback: markDismissed,
      }).showToast();
    }

    function maybeShow() {
      window.checkCart42().then(function (data) {
        if (data && data.items_count > 0) {
          showCartNotification();
        }
      });
    }

    if (isDismissed()) {
      return;
    }

    // The interval runs from the first item in the cart. The start time is read
    // from the cookie, not the page, so cached HTML cannot fire the reminder
    // early. A negative remaining means the interval is over already.
    const startedAt =
      parseInt(
        (document.cookie.match(
          new RegExp("(?:^|; )" + cartNotificationData.cookie + "=(\\d+)"),
        ) || [])[1],
        10,
      ) * 1000 || 0;
    const remainingMs = startedAt
      ? startedAt + Number(cartNotificationData.delayMs) - Date.now()
      : 0;

    if (remainingMs <= 0) {
      maybeShow();
    } else {
      window.setTimeout(maybeShow, remainingMs);
    }
  });
})(jQuery);
