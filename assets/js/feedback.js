(() => {
  'use strict';
  const menu = document.querySelector('.main-nav');
  if (!menu) return;
  const mobile = matchMedia('(max-width: 767px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  const storageKey = 'kabukura.portal.feedback.v1';
  let sound = false, vibration = false, persistent = true;
  let audioUnavailable = !AudioEngine, vibrationUnavailable = typeof navigator.vibrate !== 'function';
  let context, epoch = 0, lastTap = -Infinity;
  const voices = new Set();
  try {
    const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
    sound = saved?.sound === true;
    vibration = saved?.vibration === true;
  } catch { persistent = false; }
  // The tab remembers preferences, but loading a page never starts audio/haptics.
  const panel = document.createElement('div');
  panel.className = 'feedback-settings';
  panel.setAttribute('role', 'group');
  panel.setAttribute('aria-label', '操作のフィードバック設定');
  const soundButton = document.createElement('button');
  const vibrationButton = document.createElement('button');
  const note = document.createElement('small');
  soundButton.type = vibrationButton.type = 'button';
  soundButton.dataset.feedback = 'sound';
  vibrationButton.dataset.feedback = 'vibration';
  soundButton.setAttribute('aria-label', '操作音 SOUND');
  vibrationButton.setAttribute('aria-label', '振動');
  note.id = 'feedback-note';
  note.setAttribute('aria-live', 'polite');
  soundButton.setAttribute('aria-describedby', note.id);
  vibrationButton.setAttribute('aria-describedby', note.id);
  panel.append(soundButton, vibrationButton, note);
  menu.append(panel);

  function render() {
    soundButton.disabled = audioUnavailable;
    vibrationButton.disabled = vibrationUnavailable || reduced.matches;
    soundButton.setAttribute('aria-pressed', String(sound && !audioUnavailable));
    vibrationButton.setAttribute('aria-pressed', String(vibration && !vibrationButton.disabled));
    soundButton.textContent = audioUnavailable ? '音：利用不可' : `SOUND ${sound ? 'ON' : 'OFF'}`;
    vibrationButton.textContent = vibrationUnavailable ? '振動：非対応' : reduced.matches ? '振動：軽減設定中' : `振動 ${vibration ? 'ON' : 'OFF'}`;
    note.textContent = persistent ? '設定はこのタブ内で有効です。' : '設定はこのページ内で有効です。';
  }
  function save() {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ sound, vibration })); }
    catch { persistent = false; }
    render();
  }
  function silence() {
    epoch++;
    voices.forEach(voice => {
      try { voice.osc.stop(); } catch { /* Already ended. */ }
      voice.osc.disconnect();
      voice.gain.disconnect();
    });
    voices.clear();
  }
  function audioFailed() {
    silence();
    audioUnavailable = true;
    sound = false;
    save();
  }
  function play(kind) {
    if (!sound || audioUnavailable) return;
    silence();
    const request = epoch;
    try {
      // Construct/resume only inside a trusted user gesture, never at startup.
      context ||= new AudioEngine();
      const ready = context.state === 'running' ? Promise.resolve() : context.resume();
      ready.then(() => {
        if (request !== epoch || !sound || !mobile.matches || document.hidden) return;
        try {
          const notes = kind === 'game' ? [[392, 0, .1], [523.25, .08, .1], [783.99, .16, .14]]
            : kind === 'door' || kind === 'page' ? [[130.81, 0, .09], [98, .06, .1]]
            : [[659.25, 0, .075]];
          const start = context.currentTime;
          notes.forEach(([frequency, offset, duration]) => {
            const osc = context.createOscillator(), gain = context.createGain();
            const voice = { osc, gain };
            voices.add(voice);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(frequency, start + offset);
            gain.gain.setValueAtTime(0, start + offset);
            gain.gain.linearRampToValueAtTime(.035, start + offset + .006);
            gain.gain.linearRampToValueAtTime(0, start + offset + duration);
            osc.connect(gain);
            gain.connect(context.destination);
            osc.onended = () => { osc.disconnect(); gain.disconnect(); voices.delete(voice); };
            osc.start(start + offset);
            osc.stop(start + offset + duration);
          });
        } catch { audioFailed(); }
      }).catch(() => { if (request === epoch) audioFailed(); });
    } catch { audioFailed(); }
  }
  function vibrate() {
    if (!vibration || vibrationUnavailable || reduced.matches) return;
    try {
      if (navigator.vibrate(15) === false) {
        vibrationUnavailable = true;
        vibration = false;
        save();
      }
    } catch { vibrationUnavailable = true; vibration = false; save(); }
  }
  function cancelFeedback() {
    silence();
    if (!vibrationUnavailable && vibration) {
      try { navigator.vibrate(0); } catch { /* Optional capability. */ }
    }
    if (context?.state === 'running') context.suspend().catch(() => {});
  }
  // Capture also sees the hamburger's click, whose existing handler stops bubbling.
  // Never prevent a click or await audio: navigation retains its own short timer.
  document.addEventListener('click', event => {
    if (!event.isTrusted || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !mobile.matches || document.hidden) return;
    const setting = event.target.closest('[data-feedback]');
    if (setting) {
      if (setting.disabled) return;
      if (setting.dataset.feedback === 'sound') {
        sound = !sound;
        if (sound) play('button'); else silence();
      } else {
        vibration = !vibration;
        if (vibration) vibrate();
      }
      save();
      return;
    }
    const control = event.target.closest('a[data-navigation], .menu-toggle, [data-character], .modal-close');
    if (!control || control.disabled || control.dataset.navigation === 'scroll' || control.hasAttribute('download') || control.getAttribute('target') === '_blank') return;
    const now = performance.now();
    if (now - lastTap < 120) return;
    lastTap = now;
    play(control.dataset.navigation || 'button');
    vibrate();
  }, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancelFeedback(); });
  window.addEventListener('pagehide', cancelFeedback);
  mobile.addEventListener('change', () => { if (!mobile.matches) cancelFeedback(); });
  reduced.addEventListener('change', () => { cancelFeedback(); render(); });
  render();
})();
