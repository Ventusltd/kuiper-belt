// LEARN THE KUIPER: audio-unlock.js (loaded before start-here.js and every module). One job: make sound work on phones.
// - Every AudioContext any script creates (window.AudioContext or window.webkitAudioContext) is tracked in one list.
// - On every user gesture (touchend, pointerup, click, keydown on document; bubble phase, passive, never stopping
//   propagation; no capture-phase window listener) every tracked context that is not running is resumed, inside the gesture.
// - iOS 17 and later: navigator.audioSession.type = 'playback', so Web Audio plays with the silent switch on.
//   Older iOS: one looping silent HTML audio element (a tiny WAV built here, no network) is started in the same gesture,
//   which moves the page to the playback category. It stops when the page is hidden and when the player mutes.
// - The page hidden: every context is suspended; the next gesture resumes them.
// - window.KGAudio = { state(), contexts(), muted, setMuted(bool) }. setMuted(true) suspends every tracked context.
// What cannot be proven off a real iPhone: the silent-switch behaviour. Chrome can only prove tracking, resume and mute.
(function (root) {
  'use strict';
  if (root.KGAudio) return;
  var list = [], muted = false, silentEl = null, hidden = false;
  var IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  function live() { list = list.filter(function (c) { return c.state !== 'closed'; }); return list; }
  function track(c) { list.push(c); if (muted || hidden) { try { c.suspend(); } catch (e) {} } return c; }
  function wrap(name) {
    var Orig = root[name]; if (typeof Orig !== 'function' || Orig.__kgWrapped) return;
    var W = class extends Orig { constructor(o) { if (o === undefined) super(); else super(o); track(this); } };
    W.__kgWrapped = true;
    try { root[name] = W; } catch (e) {}
  }
  wrap('AudioContext'); wrap('webkitAudioContext');
  // a tiny silent WAV: 8 kHz, 8-bit mono, 0.1 s of the mid value (128); built here so nothing is fetched
  function silentWav() {
    var n = 800, b = [], i;
    function s(t) { for (var j = 0; j < t.length; j++) b.push(t.charCodeAt(j)); }
    function u32(v) { b.push(v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255); }
    function u16(v) { b.push(v & 255, (v >>> 8) & 255); }
    s('RIFF'); u32(36 + n); s('WAVE'); s('fmt '); u32(16); u16(1); u16(1); u32(8000); u32(8000); u16(1); u16(8); s('data'); u32(n);
    for (i = 0; i < n; i++) b.push(128);
    var str = ''; for (i = 0; i < b.length; i++) str += String.fromCharCode(b[i]);
    return 'data:audio/wav;base64,' + btoa(str);
  }
  function silentStart() {
    if (!IOS || muted || hidden) return;
    try {
      if (!silentEl) { silentEl = document.createElement('audio'); silentEl.src = silentWav(); silentEl.loop = true; silentEl.setAttribute('playsinline', ''); silentEl.setAttribute('x-webkit-airplay', 'deny'); silentEl.preload = 'auto'; silentEl.volume = 0.01; }
      if (silentEl.paused) { var p = silentEl.play(); if (p && p.catch) p.catch(function () {}); }
    } catch (e) {}
  }
  function silentStop() { try { if (silentEl && !silentEl.paused) silentEl.pause(); } catch (e) {} }
  function session() { try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (e) {} }
  function resumeAll() {
    live().forEach(function (c) {
      if (c.state !== 'running') { try { var p = c.resume(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }
      // iOS: a one-sample silent buffer started inside the gesture finishes the unlock
      try { var src = c.createBufferSource(); src.buffer = c.createBuffer(1, 1, c.sampleRate || 44100); src.connect(c.destination); src.start(0); } catch (e) {}
    });
  }
  function gesture() {
    if (hidden || document.hidden) return;
    if (muted) return;
    session();
    if (!navigator.audioSession) silentStart();
    resumeAll();
  }
  function suspendAll() { live().forEach(function (c) { if (c.state === 'running') { try { var p = c.suspend(); if (p && p.catch) p.catch(function () {}); } catch (e) {} } }); }
  ['touchend', 'pointerup', 'click', 'keydown'].forEach(function (t) { document.addEventListener(t, gesture, { passive: true }); });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { hidden = true; suspendAll(); silentStop(); }
    else hidden = false;   // resumed by the next gesture
  });
  root.KGAudio = {
    state: function () { var l = live(), s = 'none'; for (var i = 0; i < l.length; i++) { if (l[i].state === 'running') return 'running'; s = l[i].state; } return s; },
    contexts: function () { return live().slice(); },
    get muted() { return muted; },
    setMuted: function (b) { muted = !!b; if (muted) { suspendAll(); silentStop(); } else gesture(); return muted; }
  };
})(window);
