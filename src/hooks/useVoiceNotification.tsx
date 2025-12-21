import { useCallback, useRef } from 'react';

type NotificationType = 'payment' | 'appointment' | 'teacher_registration' | 'teacher_contract' | 'withdrawal' | 'general';

interface NotificationSounds {
  payment: string;
  appointment: string;
  teacher_registration: string;
  teacher_contract: string;
  withdrawal: string;
  general: string;
}

// Notification sound URLs (using Web Audio API for custom sounds)
const soundFrequencies: NotificationSounds = {
  payment: 'payment',
  appointment: 'appointment',
  teacher_registration: 'registration',
  teacher_contract: 'contract',
  withdrawal: 'withdrawal',
  general: 'general',
};

export const useVoiceNotification = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthRef = useRef<SpeechSynthesis | null>(null);

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playNotificationSound = useCallback((type: NotificationType) => {
    const audioContext = getAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sound patterns for different notification types
    switch (type) {
      case 'payment':
        // Cheerful rising tone for payments
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.3); // C6
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        break;
        
      case 'appointment':
        // Gentle bell-like tone
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
        
      case 'teacher_registration':
        // Welcoming ascending melody
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4
        oscillator.frequency.setValueAtTime(554.37, audioContext.currentTime + 0.15); // C#5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.3); // E5
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.45); // A5
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
        break;
        
      case 'teacher_contract':
        // Professional confirmation tone
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(392, audioContext.currentTime); // G4
        oscillator.frequency.setValueAtTime(493.88, audioContext.currentTime + 0.1); // B4
        oscillator.frequency.setValueAtTime(587.33, audioContext.currentTime + 0.2); // D5
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.35);
        break;
        
      case 'withdrawal':
        // Important alert tone
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.4);
        break;
        
      default:
        // Standard notification sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, []);

  const speakNotification = useCallback((message: string, type: NotificationType) => {
    // Play sound first
    playNotificationSound(type);

    // Only speak for certain notification types
    if (type === 'teacher_contract') {
      // Contract submissions only play sound, no voice
      return;
    }

    // Use Web Speech API for voice notifications
    if ('speechSynthesis' in window) {
      const synth = window.speechSynthesis;
      
      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      
      // Get American English female voice
      const voices = synth.getVoices();
      const americanFemaleVoice = voices.find(voice => 
        voice.lang.includes('en-US') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('samantha') ||
         voice.name.toLowerCase().includes('victoria') ||
         voice.name.toLowerCase().includes('alex') === false)
      ) || voices.find(voice => voice.lang.includes('en-US')) || voices[0];
      
      if (americanFemaleVoice) {
        utterance.voice = americanFemaleVoice;
      }
      
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for female voice
      utterance.volume = 1;

      // Small delay after sound to let it play
      setTimeout(() => {
        synth.speak(utterance);
      }, 600);
    }
  }, [playNotificationSound]);

  const notifyPayment = useCallback((adminName: string, courseName: string, amount: number, studentName: string, courseLevel: string) => {
    const message = `Dear ${adminName} Admin, you have a new paid course of ${courseName} of ${amount} dollars now. Please go and check by clicking the notification message to see the details of the paid course by student ${studentName} at ${courseLevel} level.`;
    speakNotification(message, 'payment');
  }, [speakNotification]);

  const notifyAppointment = useCallback((adminName: string, teacherName: string, country: string, packageType: string) => {
    const message = `Dear ${adminName}, you have a new appointment request from ${teacherName} from ${country}. This is for the ${packageType} package.`;
    speakNotification(message, 'appointment');
  }, [speakNotification]);

  const notifyTeacherRegistration = useCallback((adminName: string, teacherName: string) => {
    const message = `Dear ${adminName}, ${teacherName} has paid the 99 dollar registration fee to create a teacher account.`;
    speakNotification(message, 'teacher_registration');
  }, [speakNotification]);

  const notifyTeacherContract = useCallback(() => {
    // Only plays sound, no voice
    playNotificationSound('teacher_contract');
  }, [playNotificationSound]);

  const notifyWithdrawal = useCallback((adminName: string, teacherName: string, amount: number) => {
    const message = `Dear ${adminName}, ${teacherName} has requested a withdrawal of ${amount} dollars. Please review and approve or reject the request.`;
    speakNotification(message, 'withdrawal');
  }, [speakNotification]);

  return {
    notifyPayment,
    notifyAppointment,
    notifyTeacherRegistration,
    notifyTeacherContract,
    notifyWithdrawal,
    playNotificationSound,
    speakNotification,
  };
};
