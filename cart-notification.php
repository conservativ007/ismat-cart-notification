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
    // Проверяем, что WooCommerce активен
    // if (!class_exists('WooCommerce')) {
    //     return;
    // }

    // Подключаем JS файл
    wp_enqueue_script(
      'cart-notification-js',
      plugin_dir_url(__FILE__) . 'assets/js/cart-notification.js',
      array('jquery'),
      '1.0.5',
      true
    );

    // Передаем данные в JS
    wp_localize_script('cart-notification-js', 'cartNotificationData', array(
      'hasItems' => WC()->cart->get_cart_contents_count() > 0,
      'cartCount' => WC()->cart->get_cart_contents_count(),
      'cartUrl' => wc_get_cart_url(),
      'intervalHours' => get_option('cart_notification_interval', 2),
      'notificationText' => get_option('cart_notification_text', 'У вас есть товары в корзине'),
      'enabled' => get_option('cart_notification_enabled', '1')
    ));
  }
}

// Запуск плагина
Cart_Notification::get_instance();
