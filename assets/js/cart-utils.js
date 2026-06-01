async function checkCart42() {
  // use WooCommerce Store API (REST API v3)
  // return new Promise((resolve, reject) => {
  //   $.ajax({
  //     url: "/wp-json/wc/store/v1/cart",
  //     type: "GET",
  //     dataType: "json",
  //     success: function (response) {
  //       if (response && typeof response.items_count !== "undefined") {
  //         resolve(true);
  //       } else {
  //         resolve(false);
  //       }
  //     },
  //     error: function (xhr, status, error) {
  //       console.error("Cart notification API error:", status, error);
  //       // console.log("XHR:", xhr);
  //       reject(error);
  //     },
  //   });
  // });

  try {
    const response = await fetch("/wp-json/wc/store/v1/cart");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Check if the data exists and items_count is defined
    // console.log(data);
    // return data && data.items_count > 0;
    return data;
  } catch (error) {
    console.error("Cart notification API error:", error);
    return false; // Or throw error depending on how you handle it
  }
}

window.checkCart42 = checkCart42;
