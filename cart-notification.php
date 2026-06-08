<?php

/**
 * Plugin Name: Cart Notification
 * Description: Показывает уведомление о товарах в корзине при повторном визите
 * Version: 1.0
 */

// Защита от прямого доступа
if (!defined('ABSPATH')) {
  exit;
}

class Cart_Notification
{
  private static $instance = null;

  // Singleton
  public static function get_instance()
  {
    if (self::$instance === null) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  private function __construct()
  {
    // Хуки инициализации
    add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
  }

  // Подключение скриптов
  public function enqueue_scripts()
  {
    if (!class_exists('WooCommerce') || !function_exists('WC') || !WC()->cart) {
      return;
    }

    wp_enqueue_style(
      'toastify-css',
      get_stylesheet_directory_uri() . '/assets/css/toastify/toastify.css',
      array(),
      '1.12.0'
    );

    wp_enqueue_script(
      'toastify-js',
      get_stylesheet_directory_uri() . '/assets/js/toastify/toastify.js',
      array(),
      '1.12.0',
      true
    );

    wp_enqueue_script(
      'cart-utils-js',
      plugin_dir_url(__FILE__) . 'assets/js/cart-utils.js',
      array(),
      '1.0.1'
    );

    wp_enqueue_script(
      'cart-notification-js',
      plugin_dir_url(__FILE__) . 'assets/js/cart-notification.js',
      array('jquery', 'cart-utils-js', 'toastify-js'),
      '1.0.6',
      true
    );

    // wp_enqueue_script(
    //   'cart-price-check-js',
    //   plugin_dir_url(__FILE__) . 'assets/js/cart-price-check.js',
    //   array('jquery', 'cart-utils-js'),
    //   '1.0.1',
    //   true
    // );

    $data = array(
      'cartUrl' => wc_get_cart_url(),
      'intervalHours' => 2,
      'priceCheckInterval' => 3,
      'notificationText' => 'У вас есть товары в корзине',
      'enabled' => get_option('cart_notification_enabled', '1')
    );

    wp_localize_script('cart-notification-js', 'cartNotificationData', $data);
    // wp_localize_script('cart-price-check-js', 'cartNotificationData', $data);
  }
}

// start the plugin
Cart_Notification::get_instance();
