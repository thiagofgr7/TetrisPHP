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
  // The arrangement and the other three chiptune tracks are original to TetrisPHP.
  const KOROBEINIKI_A = [
    [76, 1], [71, 0.5], [72, 0.5], [74, 1], [72, 0.5], [71, 0.5],
    [69, 1], [69, 0.5], [72, 0.5], [76, 1], [74, 0.5], [72, 0.5],
    [71, 1.5], [72, 0.5], [74, 1], [76, 1], [72, 1], [69, 1], [69, 1],
    [74, 1], [77, 0.5], [81, 0.5], [79, 1], [77, 0.5], [76, 0.5],
    [72, 1], [76, 0.5], [74, 0.5], [72, 1], [71, 1], [72, 1],
    [74, 1], [76, 1], [72, 1], [69, 1], [69, 1]
  ];
  const KOROBEINIKI_B = [
    [76, 1], [79, 0.5], [83, 0.5], [81, 1], [79, 0.5], [77, 0.5],
    [76, 1], [72, 0.5], [74, 0.5], [76, 1], [77, 0.5], [79, 0.5],
    [81, 1.5], [79, 0.5], [77, 1], [76, 1], [74, 1], [72, 1], [71, 1],
    [69, 1], [72, 0.5], [76, 0.5], [74, 1], [72, 0.5], [71, 0.5],
    [69, 1], [67, 0.5], [69, 0.5], [72, 1], [71, 1], [69, 1],
    [67, 1], [69, 1], [71, 1], [72, 1], [76, 1]
  ];

  const NEON_A = [
    [76, 0.5], [79, 0.5], [83, 1], [79, 0.5], [76, 0.5], [74, 1],
    [76, 0.5], [79, 0.5], [86, 1], [83, 0.5], [79, 0.5], [76, 1],
    [74, 0.5], [76, 0.5], [79, 1], [83, 1], [81, 0.5], [79, 0.5],
    [76, 1], [74, 0.5], [71, 0.5], [74, 1], [76, 1], [79, 1]
  ];
  const NEON_B = [
    [83, 0.5], [86, 0.5], [88, 1], [86, 0.5], [83, 0.5], [81, 1],
    [79, 0.5], [81, 0.5], [83, 1], [86, 0.5], [83, 0.5], [79, 1],
    [76, 0.5], [79, 0.5], [81, 1], [83, 1], [86, 0.5], [83, 0.5],
    [81, 1], [79, 0.5], [76, 0.5], [74, 1], [76, 1], [79, 1]
  ];

  const SUNRISE_A = [
    [72, 1], [76, 0.5], [79, 0.5], [84, 1], [83, 0.5], [79, 0.5],
    [76, 1], [79, 0.5], [84, 0.5], [88, 1], [86, 0.5], [84, 0.5],
    [83, 1], [79, 1], [76, 1], [72, 1], [74, 0.5], [77, 0.5],
    [81, 1], [79, 0.5], [77, 0.5], [74, 1], [72, 1], [76, 1]
  ];
  const SUNRISE_B = [
    [79, 0.5], [84, 0.5], [88, 1], [91, 0.5], [88, 0.5], [84, 1],
    [83, 0.5], [86, 0.5], [88, 1], [86, 0.5], [84, 0.5], [81, 1],
    [79, 0.5], [83, 0.5], [86, 1], [84, 1], [81, 1], [79, 1],
    [76, 1], [79, 0.5], [83, 0.5], [81, 1], [79, 1], [76, 1]
  ];

  const RUSH_A = [
    [81, 0.5], [81, 0.5], [88, 1], [86, 0.5], [84, 0.5], [81, 1],
    [79, 0.5], [79, 0.5], [86, 1], [84, 0.5], [83, 0.5], [79, 1],
    [76, 0.5], [79, 0.5], [81, 1], [84, 0.5], [83, 0.5], [81, 1],
    [79, 0.5], [76, 0.5], [79, 1], [81, 1], [76, 1], [72, 1]
  ];
  const RUSH_B = [
    [88, 0.5], [88, 0.5], [91, 1], [88, 0.5], [86, 0.5], [84, 1],
    [86, 0.5], [86, 0.5], [89, 1], [86, 0.5], [84, 0.5], [83, 1],
    [81, 0.5], [84, 0.5], [88, 1], [86, 0.5], [84, 0.5], [81, 1],
    [79, 0.5], [81, 0.5], [84, 1], [83, 1], [81, 1], [76, 1]
  ];

  function makeArrangement(phrases, sections) {
    return sections.flatMap((section) => phrases[section.phrase].map(([note, beats]) => [
      note === 0 ? 0 : note + (section.transpose || 0),
      beats * (section.stretch || 1)
    ]));
  }

  const PLAYLIST = [
    {
      id: 'korobeiniki',
      name: 'KOROBEINIKI',
      style: 'FOLK ARCADE',
      bpm: 142,
      melody: makeArrangement([KOROBEINIKI_A, KOROBEINIKI_B], [
        { phrase: 0 }, { phrase: 1 }, { phrase: 0 },
        { phrase: 1, transpose: -12 }, { phrase: 0 }, { phrase: 1 }
      ]),
      bass: [40, 45, 38, 45, 36, 43, 40, 47, 40, 45, 38, 43]
    },
    {
      id: 'neon-circuit',
      name: 'NEON CIRCUIT',
      style: 'SYNTHWAVE',
      bpm: 132,
      melody: makeArrangement([NEON_A, NEON_B], [
        { phrase: 0 }, { phrase: 1 }, { phrase: 0 },
        { phrase: 1, transpose: -12 }, { phrase: 0 }, { phrase: 1 }
      ]),
      bass: [40, 40, 47, 47, 36, 36, 43, 43, 38, 38, 45, 45]
    },
    {
      id: 'pixel-sunrise',
      name: 'PIXEL SUNRISE',
      style: 'BRIGHT ARCADE',
      bpm: 126,
      melody: makeArrangement([SUNRISE_A, SUNRISE_B], [
        { phrase: 0 }, { phrase: 1 }, { phrase: 0, transpose: -12 },
        { phrase: 1 }, { phrase: 0 }, { phrase: 1, transpose: -12 }
      ]),
      bass: [36, 43, 40, 47, 41, 48, 36, 43, 33, 40, 38, 45]
    },
    {
      id: 'last-player',
      name: 'LAST PLAYER',
      style: 'ARCADE CHASE',
      bpm: 154,
      melody: makeArrangement([RUSH_A, RUSH_B], [
        { phrase: 0 }, { phrase: 1 }, { phrase: 0 },
        { phrase: 1 }, { phrase: 0, transpose: -12 }, { phrase: 1 }
      ]),
      bass: [33, 33, 40, 40, 36, 36, 43, 43, 38, 38, 45, 45]
    }
  ];

  let settings = loadSettings();
  let context = null;
  let musicBus = null;
  let sfxBus = null;
  let musicTimer = null;
  let musicIndex = 0;
  let nextNoteTime = 0;
  let currentMode = 'infinite';
  let currentTrackIndex = -1;
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

  function getCurrentTrack() {
    return currentTrackIndex < 0 ? null : PLAYLIST[currentTrackIndex];
  }

  function publishTrackChange() {
    const track = getCurrentTrack();
    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('tetris-audio-track-change', {
        detail: track ? {
          id: track.id,
          name: track.name,
          style: track.style,
          durationSeconds: Math.round(
            track.melody.reduce((total, note) => total + note[1], 0) * 60 / track.bpm
          )
        } : null
      }));
    }
  }

  function selectNextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    musicIndex = 0;
    publishTrackChange();
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

    if (!getCurrentTrack()) {
      return;
    }

    const horizon = context.currentTime + 0.24;

    while (nextNoteTime < horizon) {
      // Re-read the active track on every iteration so the next song starts
      // immediately after the previous arrangement reaches its final note.
      const track = getCurrentTrack();
      const bpm = track.bpm + (currentMode === 'time_attack' ? 8 : 0);
      const beat = 60 / bpm;
      const note = track.melody[musicIndex];
      const noteDuration = beat * note[1];

      if (note[0] > 0) {
        scheduleTone(note[0], nextNoteTime, noteDuration * 0.84, musicBus, {
          waveform: 'square',
          volume: 0.42
        });

        // A quiet triangle harmony gives the melody more body without crowding it.
        if (musicIndex % 3 === 0 && note[0] >= 69) {
          scheduleTone(note[0] - 12, nextNoteTime, noteDuration * 0.72, musicBus, {
            waveform: 'triangle',
            volume: 0.12
          });
        }
      }

      if (musicIndex % 6 === 0) {
        const bassIndex = Math.floor(musicIndex / 6) % track.bass.length;
        scheduleTone(track.bass[bassIndex], nextNoteTime, beat * 1.55, musicBus, {
          waveform: 'triangle',
          volume: 0.34
        });
      }

      nextNoteTime += noteDuration;
      musicIndex += 1;

      if (musicIndex >= track.melody.length) {
        selectNextTrack();
      }
    }
  }

  function startMusic(mode = 'infinite') {
    currentMode = mode === 'time_attack' ? 'time_attack' : 'infinite';

    // A resume continues the same song; a new match advances to the next track.
    if (!gameActive) {
      selectNextTrack();
      gameActive = true;
    }

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
      nextNoteTime = context.currentTime + 0.06;
      setGain(musicBus, settings.musicVolume);
      scheduleMusic();
      musicTimer = window.setInterval(scheduleMusic, 70);
    });
  }

  function pauseMusic() {
    musicPaused = true;
    stopMusicScheduler();
    if (context) {
      nextNoteTime = context.currentTime + 0.06;
    }
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
        if (context) {
          nextNoteTime = context.currentTime + 0.06;
        }
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

  function getPlaylist() {
    return PLAYLIST.map((track) => ({
      id: track.id,
      name: track.name,
      style: track.style,
      durationSeconds: Math.round(
        track.melody.reduce((total, note) => total + note[1], 0) * 60 / track.bpm
      )
    }));
  }

  window.TetrisAudio = Object.freeze({
    getSettings,
    getPlaylist,
    getCurrentTrack: () => {
      const track = getCurrentTrack();
      return track ? getPlaylist().find((item) => item.id === track.id) : null;
    },
    updateSettings,
    startMusic,
    pauseMusic,
    stopMusic,
    play
  });
})();