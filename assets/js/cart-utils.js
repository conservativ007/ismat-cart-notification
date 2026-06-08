async function checkCart42() {
  try {
    const response = await fetch("/wp-json/wc/store/v1/cart");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Cart notification API error:", error);
    return false; // Or throw error depending on how you handle it
  }
}

window.checkCart42 = checkCart42;
