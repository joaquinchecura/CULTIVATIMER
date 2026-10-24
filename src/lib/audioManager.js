// src/lib/audioManager.js
const sounds = {
    beep: new Audio('/sounds/beep.mp3'),
    bell: new Audio('/sounds/bell.mp3'),
    digital: new Audio('/sounds/digital.mp3'),
    soft: new Audio('/sounds/soft.mp3'),
    short: new Audio('/sounds/buzzer-short.mp3'),
    countdown: new Audio('/sounds/buzzer-countdown.mp3'),
    alarm: new Audio('/sounds/buzzer-alarm.mp3'),
  };
  
  export const playSound = (type, volume = 100) => {
    const sound = sounds[type];
    if (sound) {
      sound.volume = volume / 100;
      sound.currentTime = 0; // Reiniciar por si se reproduce varias veces
      sound.play().catch(e => console.log("Audio play blocked:", e));
    }
  };
  
  export const playBuzzer = (type, volume = 100) => {
    if (type === 'off') return;
    playSound(type, volume);
  };