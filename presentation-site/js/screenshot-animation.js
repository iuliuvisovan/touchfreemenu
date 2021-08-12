// Custom Scripts for Primal Template //

let currentActiveScreenshotIndex = 0;

jQuery(function ($) {
  'use strict';

  setInterval(() => {
    currentActiveScreenshotIndex++;
    if (currentActiveScreenshotIndex == 3) {
      currentActiveScreenshotIndex = 0;
    }
    $('.screenshot').removeClass('active');
    setTimeout(() => {
      $($('.screenshot')[currentActiveScreenshotIndex]).addClass('active');
    }, 500);
  }, 5000);
});
