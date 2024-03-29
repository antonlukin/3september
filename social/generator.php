<?php
/**
 * Social posters generator
 *
 * @author Anton Lukin
 * @version 1.0
 */

use PosterEditor\PosterEditor;

require __DIR__ . '/../vendor/autoload.php';


/**
 * Add spaces to number
 */
function spaces($number) {
    return number_format($number, 0, ',', ' ');
}


/**
 * Add title in proper form
 */
function sanitize($number) {
    if ($number > 9 && $number < 20) {
        return spaces($number) . " раз";
    }

    if ($number % 10 < 2 || $number % 10 > 4) {
      return spaces($number) . " раз";
    }

    return spaces($number) . " раза";
}


/**
 * Decrypt count from request uri
 */
function decrypt($path, $count = 0)  {
    $slug = explode('/', trim($path, '/'));

    if (isset($slug[1])) {
        $number = preg_replace('/[^\d]+/', '', $slug[1]);

        // Create salt as 9 x (slug length)
        $salt = str_pad('', strlen($number), '9');

        // Calculate count
        $count = (int) $salt - (int) $number;
    }

    return $count;
}


{
    $count = decrypt(urldecode($_SERVER['REQUEST_URI']));

    // Set default image path
    $image = "/posters/default.jpg";

    // Set default title
    $title = "Я календарь перевернул и снова третье сентября...";

    // Update image and title if count valid
    if ($count < 10000 && $count > 0) {
        $image = "/posters/{$count}.jpg";

        // Update title with count
        $title = "Я календарь перевернул " . sanitize($count) . " и снова третье сентября...";
    }

    // Generate cover if not exists
    if (!file_exists(__DIR__ . $image)) {
        try {
            $poster = new PosterEditor();
            $poster->make(__DIR__ . '/include/poster.png');

            $poster->text($title, array(
                'x'          => 50,
                'y'          => 440,
                'width'      => 1100,
                'fontsize'   => 24,
                'fontpath'   => __DIR__ . '/include/opensans.ttf',
                'horizontal' => 'center',
                'color'      => '#ffffff',
            ));

            $poster->save(__DIR__ . $image);
        } catch(Exception $e) {
            $image = "/posters/default.jpg";
        }
    }

    // Show generator template
    include_once __DIR__ . '/include/template.php';
}
