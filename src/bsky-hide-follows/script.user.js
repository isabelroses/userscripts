// ==UserScript==
// @name         Bluesky hide followers
// @namespace    bsky-hide-followers
// @match        *://bsky.app/*
// @match        *://catsky.social/*
// @grant        none
// @version      2.0.0
// @author       isabel roses <isabel@isabelroses.com>
// @description  17/10/2025, 15:36:55
// @run-at       document-idle
// @updateURL    https://github.com/isabelroses/userscripts/raw/refs/heads/main/src/bsky-hide-follows/script.user.js
// @downloadURL  https://github.com/isabelroses/userscripts/raw/refs/heads/main/src/bsky-hide-follows/script.user.js
// ==/UserScript==

(function() {
  const style = document.createElement('style');
  style.textContent = `
    a[href*="/profile/"][href$="/followers"],
    a[href*="/profile/"][href$="/follows"],
    button[data-testid="likeBtn"] div:nth-child(2),
    button[data-testid="repostBtn"] div:nth-child(2) {
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
