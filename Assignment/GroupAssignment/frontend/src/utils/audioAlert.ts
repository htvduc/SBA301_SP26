let userInteractionEstablished = false;

const establishUserInteraction = () => {
  userInteractionEstablished = true;
};

if (typeof window !== 'undefined') {
  ['click', 'keydown', 'touchstart'].forEach(event => {
    window.addEventListener(event, establishUserInteraction, { once: true });
  });
}

export const playNotificationSound = (soundPath: string = '/sounds/notification.mp3'): void => {
  if (!userInteractionEstablished) {
    return;
  }

  const isMuted = localStorage.getItem('notificationsMuted') === 'true';
  if (isMuted) {
    return;
  }

  const audio = new Audio(soundPath);
  
  audio.addEventListener('error', () => {
    console.warn(`Audio file not found or failed to load: ${soundPath}`);
  });
  
  audio.load();
  
  audio.play().catch((error) => {
    if (error.name === 'NotFoundError' || error.message.includes('404')) {
      console.warn(`Audio file not found: ${soundPath}`);
    } else if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
      console.info('Audio autoplay blocked by browser policy');
    } else {
      console.error('Audio playback error:', error);
    }
  });
};
