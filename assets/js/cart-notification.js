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

    async function checkCart() {
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

    // Функция показа уведомления
    function showCartNotification() {
      if (notificationShown) {
        console.log("Cart notification: уже показано в этой сессии");
        return;
      }

      const lastShown = localStorage.getItem("cart_notification_last_shown");
      const intervalHours = parseFloat(cartNotificationData.intervalHours);
      const intervalMs = intervalHours * 60 * 60 * 1000; // конвертируем часы в миллисекунды
      const now = Date.now();

      // Проверяем, нужно ли показывать уведомление
      if (lastShown) {
        const timePassed = now - parseInt(lastShown);

        // Если не прошло достаточно времени - не показываем
        if (timePassed < intervalMs) {
          console.log(
            "Cart notification: слишком рано, осталось " +
              Math.round((intervalMs - timePassed) / 1000 / 60) +
              " минут",
          );
          return;
        }
      }

      // НОВАЯ ПРОВЕРКА: время с момента добавления товара в корзину
      const cartCreatedTime = localStorage.getItem("cart_created_time");
      if (cartCreatedTime) {
        const timeFromCreation = now - parseInt(cartCreatedTime);

        if (timeFromCreation < intervalMs) {
          console.log(
            "Cart notification: слишком рано с момента добавления товара, осталось " +
              Math.round((intervalMs - timeFromCreation) / 1000 / 60) +
              " минут",
          );
          return;
        }
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
          background: "rgba(0, 0, 0, 0.7)",
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

    // Запускаем при загрузке страницы
    setTimeout(checkCart, 500);
  });
})(jQuery);
