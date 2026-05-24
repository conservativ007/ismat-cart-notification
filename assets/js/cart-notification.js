(function ($) {
  "use strict";

  // console.log(cartNotificationData);

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

  function checkCart() {
    // Используем WooCommerce Store API (REST API v3)
    $.ajax({
      url: "/wp-json/wc/store/v1/cart",
      type: "GET",
      dataType: "json",
      success: function (response) {
        // console.log("WC Store API response:", response);

        if (response && typeof response.items_count !== "undefined") {
          const cartCount = response.items_count;

          // console.log("Cart count from API:", cartCount);

          if (cartCount > 0) {
            showCartNotification(cartCount);
            // console.log("cartCount > 0", cartCount);

            // Обновляем все счетчики в DOM
            let items = document.querySelectorAll(".cart-count");

            if (items.length > 0) {
              items.forEach((item) => {
                item.innerHTML = cartCount;
                // console.log("Updated cart count element:", item);
              });
            }
          } else {
            // console.log("Cart notification: корзина пустая");
          }
        } else {
          // console.log("Cart notification: некорректный ответ API");
        }
      },
      error: function (xhr, status, error) {
        // console.error("Cart notification API error:", status, error);
        // console.log("XHR:", xhr);
      },
    });
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
        background: "#a89c8a",
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

    // Обновляем счетчик в шапке
    checkCart();
  });

  // Запускаем при загрузке страницы
  $(document).ready(function () {
    // Небольшая задержка для красоты (500мс)
    setTimeout(function () {
      checkCart();
    }, 1000);
  });
})(jQuery);
