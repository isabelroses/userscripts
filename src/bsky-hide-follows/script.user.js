// ==UserScript==
// @name        Bluesky hide followers
// @namespace   bsky-hide-followers
// @match       *://bsky.app/*
// @match       *://catsky.social/*
// @grant       none
// @version     1.0.0
// @author      isabel roses <isabel@isabelroses.com>
// @description 17/10/2025, 15:36:55
// @run-at       document-idle
// ==/UserScript==

(function() {
  const style = document.createElement('style');
  style.textContent = `
    a[href*="/profile/"][href$="/followers"],
    a[href*="/profile/"][href$="/follows"] {
      display: none !important;
      visibility: hidden !important;
    }
  `;
  const apply = () => {
    if (!document.head.contains(style)) document.head.appendChild(style);
  };
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  apply();
})();
