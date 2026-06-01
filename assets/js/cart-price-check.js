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

    let notificationShown = false;

    async function checkCart() {
      try {
        const data = await window.checkCart42();
        const isHasGoodsInCart = data.items_count > 0;
        // console.log("Has goods:", isHasGoodsInCart);

        if (isHasGoodsInCart === true) {
          let message = createMessageFromTG(data);
          showCartNotification(message);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }

    function createMessageFromTG(data) {
      let message = "Здравствуйте, я нашел у вас эти товары дешевле: \n";
      data.items.forEach((item, index) => {
        message += `${item.permalink} \n`;
      });
      return message;
    }

    // Функция показа уведомления
    function showCartNotification(message) {
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

      const linkTG = "https://t.me/IsmatDecor_official?text=";
      const buttonHtml =
        '<a href="' +
        linkTG +
        encodeURIComponent(message) +
        '" style="color: #fff; text-decoration: underline; font-weight: bold; margin-top: 8px; display: inline-block;">Напишите НАМ!</a>';
      const text = `<p style="margin-right: 20px;">Нашли дешевле ?</p>`;

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
