/* Keep companion interactions out of the site's delegated outside-click handlers.
   Bubble phase preserves the companion's own controls and pointer capture.
   Do not preventDefault: selection, clipboard shortcuts and file inputs need it. */
(() => {
  const events=['pointerdown','pointerup','pointermove','pointercancel',
    'mousedown','mouseup','mousemove','click','dblclick','contextmenu',
    'touchstart','touchmove','touchend','touchcancel',
    'keydown','keyup','keypress','focusin','focusout'];
  function install(root) {
    for(const name of events)root.addEventListener(name,event=>event.stopPropagation());
  }
  globalThis.KundolukEventBoundary={install};
})();
