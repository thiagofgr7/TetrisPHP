(() => {
  'use strict';

  const STORAGE_KEY = 'tetrisphp.audio.v1';
  const DEFAULT_SETTINGS = Object.freeze({
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.24,
    sfxVolume: 0.52
  });

  // Korobeiniki is a traditional folk melody in the public domain.
  // This is an original synthesized chiptune arrangement for TetrisPHP.
  const MELODY = [
    [76, 1], [71, 0.5], [72, 0.5], [74, 1], [72, 0.5], [71, 0.5],
    [69, 1], [69, 0.5], [72, 0.5], [76, 1], [74, 0.5], [72, 0.5],
    [71, 1.5], [72, 0.5], [74, 1], [76, 1], [72, 1], [69, 1], [69, 1],
    [74, 1], [77, 0.5], [81, 0.5], [79, 1], [77, 0.5], [76, 0.5],
    [72, 1], [76, 0.5], [74, 0.5], [72, 1], [71, 1], [72, 1],
    [74, 1], [76, 1], [72, 1], [69, 1], [69, 1]
  ];
  const BASS_LINE = [40, 45, 38, 45, 36, 43, 40, 47];
  const TEMPO = Object.freeze({ infinite: 142, time_attack: 154 });

  let settings = loadSettings();
  let context = null;
  let musicBus = null;
  let sfxBus = null;
  let musicTimer = null;
  let musicIndex = 0;
  let nextNoteTime = 0;
  let currentMode = 'infinite';
  let gameActive = false;
  let musicPaused = false;

  function clamp(value, min, max) {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : min;
  }

  function loadSettings() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!stored || typeof stored !== 'object') {
        return { ...DEFAULT_SETTINGS };
      }

      return {
        musicEnabled: typeof stored.musicEnabled === 'boolean'
          ? stored.musicEnabled : DEFAULT_SETTINGS.musicEnabled,
        sfxEnabled: typeof stored.sfxEnabled === 'boolean'
          ? stored.sfxEnabled : DEFAULT_SETTINGS.sfxEnabled,
        musicVolume: clamp(stored.musicVolume ?? DEFAULT_SETTINGS.musicVolume, 0, 1),
        sfxVolume: clamp(stored.sfxVolume ?? DEFAULT_SETTINGS.sfxVolume, 0, 1)
      };
    } catch (error) {
      return { ...DEFAULT_SETTINGS };
    }
  }

  function persistSettings() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      // Audio preferences remain active for this session if storage is unavailable.
    }
  }

  function ensureContext() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!context) {
      try {
        context = new AudioContextClass();
        musicBus = context.createGain();
        sfxBus = context.createGain();
        musicBus.gain.value = settings.musicEnabled ? settings.musicVolume : 0;
        sfxBus.gain.value = settings.sfxEnabled ? settings.sfxVolume : 0;
        musicBus.connect(context.destination);
        sfxBus.connect(context.destination);
      } catch (error) {
        context = null;
        musicBus = null;
        sfxBus = null;
      }
    }

    return context;
  }

  function unlockAudio() {
    const audio = ensureContext();
    if (!audio) {
      return Promise.resolve(false);
    }

    if (audio.state === 'suspended') {
      return audio.resume().then(() => true).catch(() => false);
    }

    return Promise.resolve(true);
  }

  function setGain(gainNode, value, ramp = 0.035) {
    if (!context || !gainNode) {
      return;
    }

    const now = context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setTargetAtTime(Math.max(0.0001, value), now, ramp);
  }

  function midiToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function scheduleTone(note, startAt, duration, bus, options = {}) {
    if (!context || !bus || note <= 0) {
      return;
    }

    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const peak = options.volume ?? 0.55;
    const endAt = startAt + Math.max(0.035, duration);

    oscillator.type = options.waveform || 'square';
    oscillator.frequency.setValueAtTime(midiToFrequency(note), startAt);
    if (options.slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(midiToFrequency(options.slideTo), endAt);
    }

    envelope.gain.setValueAtTime(0.0001, startAt);
    envelope.gain.linearRampToValueAtTime(peak, startAt + 0.006);
    envelope.gain.setValueAtTime(peak, Math.max(startAt + 0.012, endAt - 0.025));
    envelope.gain.exponentialRampToValueAtTime(0.0001, endAt);

    oscillator.connect(envelope);
    envelope.connect(bus);
    oscillator.start(startAt);
    oscillator.stop(endAt + 0.01);
  }

  function stopMusicScheduler() {
    if (musicTimer !== null) {
      window.clearInterval(musicTimer);
      musicTimer = null;
    }
  }

  function scheduleMusic() {
    if (!context || !gameActive || musicPaused || !settings.musicEnabled) {
      return;
    }

    const beat = 60 / (TEMPO[currentMode] || TEMPO.infinite);
    const horizon = context.currentTime + 0.22;

    while (nextNoteTime < horizon) {
      const note = MELODY[musicIndex];
      const noteDuration = beat * note[1];

      if (note[0] > 0) {
        scheduleTone(note[0], nextNoteTime, noteDuration * 0.86, musicBus, {
          waveform: 'square',
          volume: 0.48
        });
      }

      if (musicIndex % 4 === 0) {
        const bassIndex = (Math.floor(musicIndex / 4) + (currentMode === 'time_attack' ? 1 : 0)) % BASS_LINE.length;
        scheduleTone(BASS_LINE[bassIndex], nextNoteTime, beat * 1.65, musicBus, {
          waveform: 'triangle',
          volume: 0.42
        });
      }

      nextNoteTime += noteDuration;
      musicIndex = (musicIndex + 1) % MELODY.length;
    }
  }

  function startMusic(mode = 'infinite') {
    currentMode = mode === 'time_attack' ? 'time_attack' : 'infinite';
    gameActive = true;
    musicPaused = false;

    if (!settings.musicEnabled) {
      stopMusicScheduler();
      setGain(musicBus, 0);
      return;
    }

    unlockAudio().then((ready) => {
      if (!ready || !gameActive || musicPaused || !settings.musicEnabled) {
        return;
      }

      stopMusicScheduler();
      musicIndex = 0;
      nextNoteTime = context.currentTime + 0.06;
      setGain(musicBus, settings.musicVolume);
      scheduleMusic();
      musicTimer = window.setInterval(scheduleMusic, 80);
    });
  }

  function pauseMusic() {
    musicPaused = true;
    stopMusicScheduler();
    setGain(musicBus, 0, 0.025);
  }

  function stopMusic() {
    gameActive = false;
    musicPaused = false;
    stopMusicScheduler();
    setGain(musicBus, 0, 0.04);
  }

  const SOUND_PATTERNS = {
    move: [[67, 0.055, 0, 0.32, 'square']],
    rotate: [[75, 0.09, 0, 0.4, 'square'], [79, 0.07, 0.045, 0.24, 'triangle']],
    softDrop: [[60, 0.045, 0, 0.24, 'triangle']],
    hardDrop: [[65, 0.12, 0, 0.48, 'square'], [48, 0.18, 0.025, 0.5, 'triangle']],
    hold: [[72, 0.075, 0, 0.35, 'square'], [79, 0.09, 0.065, 0.38, 'square']],
    pause: [[72, 0.1, 0, 0.34, 'square'], [67, 0.13, 0.085, 0.3, 'triangle']],
    resume: [[67, 0.09, 0, 0.3, 'triangle'], [76, 0.1, 0.075, 0.36, 'square']],
    start: [[72, 0.09, 0, 0.34, 'square'], [79, 0.09, 0.085, 0.36, 'square'], [84, 0.16, 0.17, 0.4, 'square']],
    lineClear: [[76, 0.09, 0, 0.36, 'square'], [83, 0.13, 0.075, 0.42, 'square']],
    tetris: [[76, 0.12, 0, 0.38, 'square'], [81, 0.12, 0.1, 0.4, 'square'], [88, 0.14, 0.2, 0.44, 'square'], [93, 0.24, 0.31, 0.5, 'square']],
    tSpin: [[79, 0.1, 0, 0.38, 'square'], [83, 0.1, 0.09, 0.4, 'square'], [86, 0.13, 0.18, 0.44, 'square'], [91, 0.2, 0.29, 0.48, 'triangle']],
    levelUp: [[72, 0.1, 0, 0.32, 'square'], [76, 0.1, 0.09, 0.36, 'square'], [79, 0.1, 0.18, 0.4, 'square'], [84, 0.2, 0.27, 0.45, 'square']],
    gameOver: [[71, 0.15, 0, 0.4, 'triangle'], [67, 0.16, 0.14, 0.4, 'triangle'], [64, 0.19, 0.29, 0.42, 'triangle'], [59, 0.34, 0.47, 0.44, 'triangle']]
  };

  function play(name, detail) {
    if (!settings.sfxEnabled) {
      return;
    }

    unlockAudio().then((ready) => {
      if (!ready || !settings.sfxEnabled || !sfxBus) {
        return;
      }

      const now = context.currentTime + 0.012;
      let pattern = SOUND_PATTERNS[name];

      if (name === 'lineClear') {
        const lines = Math.max(1, Math.min(3, Number(detail) || 1));
        pattern = lines === 1
          ? SOUND_PATTERNS.lineClear
          : [[76, 0.09, 0, 0.36, 'square'], [79 + lines, 0.1, 0.075, 0.4, 'square'], [84 + lines, 0.17, 0.16, 0.46, 'square']];
      }

      if (!pattern) {
        return;
      }

      pattern.forEach((item) => {
        scheduleTone(item[0], now + item[2], item[1], sfxBus, {
          volume: item[3],
          waveform: item[4]
        });
      });
    });
  }

  function updateSettings(patch = {}) {
    const musicChanged = typeof patch.musicEnabled === 'boolean'
      && patch.musicEnabled !== settings.musicEnabled;

    if (typeof patch.musicEnabled === 'boolean') {
      settings.musicEnabled = patch.musicEnabled;
    }
    if (typeof patch.sfxEnabled === 'boolean') {
      settings.sfxEnabled = patch.sfxEnabled;
    }
    if (patch.musicVolume !== undefined) {
      settings.musicVolume = clamp(patch.musicVolume, 0, 1);
    }
    if (patch.sfxVolume !== undefined) {
      settings.sfxVolume = clamp(patch.sfxVolume, 0, 1);
    }

    persistSettings();

    if (context) {
      setGain(musicBus, settings.musicEnabled && gameActive && !musicPaused
        ? settings.musicVolume : 0);
      setGain(sfxBus, settings.sfxEnabled ? settings.sfxVolume : 0);
    }

    if (musicChanged) {
      if (settings.musicEnabled && gameActive && !musicPaused) {
        startMusic(currentMode);
      } else if (!settings.musicEnabled) {
        stopMusicScheduler();
      }
    }

    if (settings.sfxEnabled && patch.sfxEnabled === true) {
      unlockAudio();
    }

    return getSettings();
  }

  function getSettings() {
    return { ...settings };
  }

  window.TetrisAudio = Object.freeze({
    getSettings,
    updateSettings,
    startMusic,
    pauseMusic,
    stopMusic,
    play
  });
})();