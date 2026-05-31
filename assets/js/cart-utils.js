(function ($) {
  "use strict";

  window.CartUtils = {
    checkCart: function () {
      // use WooCommerce Store API (REST API v3)
      return new Promise((resolve, reject) => {
        $.ajax({
          url: "/wp-json/wc/store/v1/cart",
          type: "GET",
          dataType: "json",
          success: function (response) {
            if (response && typeof response.items_count !== "undefined") {
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
    },
  };

  // Просто помечаем что CartUtils готов
  window.CartUtilsReady = true;
  console.log("CartUtils готов");
})(jQuery);
