(function ($) {
  "use strict";

  $(document).ready(function () {
    // Проверяем, что данные переданы из PHP
    if (typeof cartNotificationData === "undefined") {
      return;
    }

    if (window.location.pathname.includes("/cart")) {
      return;
    }

    // console.log(cartNotificationData);

    let notificationShown = false;

    async function test42() {
      // use WooCommerce Store API (REST API v3)
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/wp-json/wc/store/v1/cart",
          type: "GET",
          dataType: "json",
          success: function (response) {
            if (response && response.items_count > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          },
          error: function (xhr, status, error) {
            console.error("Cart notification API error:", status, error);
            // console.log("XHR:", xhr);
            reject(error);
          },
        });
      });
    }

    async function checkCart() {
      try {
        const isHasGoodsInCart = await test42();
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

      const lastShown = localStorage.getItem(
        "cart_price_check_notification_last_shown",
      );
      const intervalHours = parseFloat(cartNotificationData.priceCheckInterval);
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
      const cartCreatedTime = localStorage.getItem(
        "cart_price_check_created_time",
      );
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
        cartNotificationData.telegramUrl +
        '" style="color: #fff; text-decoration: underline; font-weight: bold; margin-top: 8px; display: inline-block;">Напишите НАМ!</a>';

      const text = `<p style="margin-right: 20px;">Нашли дешевле ?</p>`;
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
      }).showToast();

      // Сохраняем timestamp показа
      localStorage.setItem(
        "cart_price_check_notification_last_shown",
        now.toString(),
      );
      notificationShown = true;

      console.log("Cart price check notification: уведомление показано");
    }

    $(document.body).on("added_to_cart", function () {
      const now = Date.now();

      // ОТДЕЛЬНЫЙ КЛЮЧ для второго уведомления
      if (!localStorage.getItem("cart_price_check_created_time")) {
        localStorage.setItem("cart_price_check_created_time", now.toString());
        console.log(
          "Price check notification: товар добавлен, таймер на 3 часа запущен",
        );
      }
    });

    setTimeout(checkCart, 500);
  });
})(jQuery);
