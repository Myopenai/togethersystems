/**
 * WebTrit Swipe Handler
 * Provides touch/swipe interaction for mobile devices
 * Copyright 2025 Raymond Demitrio Dr. Tel - ViewunitySystem
 */

(function() {
  'use strict';

  // Configuration
  const config = {
    threshold: 50, // Minimum distance for swipe
    timeLimit: 500, // Maximum time for swipe (ms)
    restraint: 100, // Maximum perpendicular distance
    allowedTime: 300
  };

  // Touch state
  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchElement = null;

  /**
   * Initialize swipe detection on element
   * @param {HTMLElement} element - Element to attach swipe listeners
   * @param {Object} callbacks - { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown }
   */
  function initSwipe(element, callbacks) {
    if (!element) return;

    element.addEventListener('touchstart', function(e) {
      const touch = e.changedTouches[0];
      touchStartX = touch.pageX;
      touchStartY = touch.pageY;
      touchStartTime = new Date().getTime();
      touchElement = element;
    }, { passive: true });

    element.addEventListener('touchend', function(e) {
      const touch = e.changedTouches[0];
      const touchEndX = touch.pageX;
      const touchEndY = touch.pageY;
      const touchEndTime = new Date().getTime();
      
      const distX = touchEndX - touchStartX;
      const distY = touchEndY - touchStartY;
      const elapsedTime = touchEndTime - touchStartTime;

      if (elapsedTime <= config.allowedTime) {
        // Horizontal swipe
        if (Math.abs(distX) >= config.threshold && Math.abs(distY) <= config.restraint) {
          if (distX > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight(element, e);
          } else if (distX < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft(element, e);
          }
        }
        // Vertical swipe
        else if (Math.abs(distY) >= config.threshold && Math.abs(distX) <= config.restraint) {
          if (distY > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown(element, e);
          } else if (distY < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp(element, e);
          }
        }
      }

      // Reset
      touchStartX = 0;
      touchStartY = 0;
      touchStartTime = 0;
    }, { passive: true });
  }

  // Auto-initialize on elements with data-swipe attribute
  document.addEventListener('DOMContentLoaded', function() {
    const swipeElements = document.querySelectorAll('[data-swipe]');
    
    swipeElements.forEach(function(el) {
      const actions = el.getAttribute('data-swipe').split(',');
      const callbacks = {};

      actions.forEach(function(action) {
        action = action.trim();
        
        if (action === 'left') {
          callbacks.onSwipeLeft = function(element) {
            element.classList.add('swiped-left');
            element.dispatchEvent(new CustomEvent('swipeleft'));
          };
        }
        if (action === 'right') {
          callbacks.onSwipeRight = function(element) {
            element.classList.add('swiped-right');
            element.dispatchEvent(new CustomEvent('swiperight'));
          };
        }
        if (action === 'up') {
          callbacks.onSwipeUp = function(element) {
            element.classList.add('swiped-up');
            element.dispatchEvent(new CustomEvent('swipeup'));
          };
        }
        if (action === 'down') {
          callbacks.onSwipeDown = function(element) {
            element.classList.add('swiped-down');
            element.dispatchEvent(new CustomEvent('swipedown'));
          };
        }
      });

      initSwipe(el, callbacks);
    });

    console.log('[WebTrit] Swipe handler initialized on', swipeElements.length, 'elements');
  });

  // Export to global
  window.WebTritSwipe = {
    init: initSwipe,
    config: config
  };

  console.log('[WebTrit] Swipe module loaded ✅');
})();

