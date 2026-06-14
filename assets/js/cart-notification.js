(function ($) {
  "use strict";

  $(document).ready(function () {
    // Проверяем, что данные переданы из PHP
    if (typeof cartNotificationData === "undefined") {
      return;
    }

    // Проверяем, включен ли функционал
    if (cartNotificationData.enabled !== "1") {
      return;
    }

    if (window.location.pathname.includes("/cart")) {
      return;
    }

    let notificationShown = false;
    let checkScheduled = false;
    let checkStarted = false;

    async function checkCart() {
      if (checkStarted || !canAttemptNotification()) {
        return;
      }

      checkStarted = true;

      try {
        const data = await window.checkCart42();
        const isHasGoodsInCart = data.items_count > 0;

        console.log("Has goods:", isHasGoodsInCart);
        if (isHasGoodsInCart === true) {
          showCartNotification();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    function canAttemptNotification() {
      return !notificationShown && canShowByInterval();
    }

    function scheduleCartCheck() {
      if (checkScheduled || !canAttemptNotification()) {
        return;
      }

      checkScheduled = true;

      const startCheck = function () {
        window.removeEventListener("scroll", startCheck);
        window.removeEventListener("pointerdown", startCheck);
        window.removeEventListener("keydown", startCheck);
        checkCart();
      };

      window.addEventListener("scroll", startCheck, {
        once: true,
        passive: true,
      });
      window.addEventListener("pointerdown", startCheck, { once: true });
      window.addEventListener("keydown", startCheck, { once: true });

      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(startCheck, { timeout: 4000 });
      } else {
        setTimeout(startCheck, 4000);
      }
    }

    function canShowByInterval() {
      const lastShown = localStorage.getItem("cart_notification_last_shown");
      const intervalHours = parseFloat(cartNotificationData.intervalHours);
      const intervalMs = intervalHours * 60 * 60 * 1000;
      const now = Date.now();
      const timestamps = [
        lastShown,
        localStorage.getItem("cart_created_time"),
      ].filter(Boolean);

      return timestamps.every(function (timestamp) {
        return now - parseInt(timestamp, 10) >= intervalMs;
      });
    }

    // Функция показа уведомления
    function showCartNotification() {
      if (notificationShown) {
        console.log("Cart notification: уже показано в этой сессии");
        return;
      }
      const now = Date.now();

      if (!canShowByInterval()) {
        return;
      }

      // Формируем текст уведомления
      let notificationText = cartNotificationData.notificationText;

      // Создаем HTML для кнопки
      const buttonHtml =
        '<a href="' +
        cartNotificationData.cartUrl +
        '" style="color: #fff; text-decoration: underline; font-weight: bold; margin-top: 8px; display: inline-block;">Перейти в корзину</a>';

      const text = `<p style="margin-right: 20px;">${notificationText}</p>`;
      // Показываем уведомление через Toastify
      Toastify({
        text: text + buttonHtml,
        duration: -1,
        gravity: "top",
        position: "right",
        close: true,
        style: {
          background: "rgba(0, 0, 0, 0.8)",
          borderRadius: "7px",
          padding: "12px 20px",
        },
        escapeMarkup: false, // Разрешаем HTML
        onClick: function () {
          // При клике на уведомление - переход в корзину
          window.location.href = cartNotificationData.cartUrl;
        },
      }).showToast();

      // Сохраняем timestamp показа
      localStorage.setItem("cart_notification_last_shown", now.toString());
      notificationShown = true;

      console.log("Cart notification: уведомление показано");
    }

    // Отслеживаем добавление товара в корзину
    $(document.body).on("added_to_cart", function () {
      const now = Date.now();

      // Если cart_created_time еще не установлен - устанавливаем
      if (!localStorage.getItem("cart_created_time")) {
        localStorage.setItem("cart_created_time", now.toString());
        console.log(
          "Cart notification: товар добавлен в корзину, таймер запущен",
        );
      }
    });

    scheduleCartCheck();
  });
})(jQuery);
