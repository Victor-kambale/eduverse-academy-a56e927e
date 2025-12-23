import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationData {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  link?: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

// Sound effects for notifications
export const playSound = (type: 'success' | 'info' | 'warning' | 'error') => {
  try {
    const sounds = {
      success: '/sounds/success.mp3',
      info: '/sounds/notification.mp3',
      warning: '/sounds/warning.mp3',
      error: '/sounds/error.mp3'
    };
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch {
    // Sound playback failed, ignore
  }
};

// Voice notification using Web Speech API
export const speakNotification = (message: string) => {
  try {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      // Use a female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Microsoft Zira'));
      if (femaleVoice) utterance.voice = femaleVoice;
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Voice playback failed, ignore
  }
};

export const createNotification = async (
  userId: string,
  data: NotificationData,
  options?: { 
    playSound?: boolean; 
    soundType?: 'success' | 'info' | 'warning' | 'error';
    speakMessage?: boolean;
    voiceMessage?: string;
  }
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        category: data.category || 'general',
        priority: data.priority || 'normal',
        link: data.link,
        action_url: data.action_url,
        metadata: data.metadata,
      });

    if (error) throw error;

    if (options?.playSound) {
      playSound(options.soundType || 'info');
    }

    if (options?.speakMessage && options?.voiceMessage) {
      setTimeout(() => speakNotification(options.voiceMessage!), 500);
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to create notification:', error);
    return { success: false, error };
  }
};

// Enrollment notifications
export const notifyEnrollment = async (userId: string, courseTitle: string, courseId: string) => {
  playSound('success');
  return createNotification(userId, {
    title: '🎉 Enrollment Successful!',
    message: `You have successfully enrolled in "${courseTitle}". Start learning now!`,
    type: 'success',
    category: 'enrollment',
    priority: 'high',
    link: `/course/${courseId}/learn`,
    action_url: `/course/${courseId}/learn`
  });
};

// Course completion notification
export const notifyCourseCompletion = async (userId: string, courseTitle: string, courseId: string) => {
  playSound('success');
  return createNotification(userId, {
    title: '🏆 Course Completed!',
    message: `Congratulations! You have completed "${courseTitle}". Your certificate is ready!`,
    type: 'success',
    category: 'achievement',
    priority: 'high',
    link: `/dashboard?tab=certificates`,
    action_url: `/verify-certificate`
  });
};

// Certificate earned notification
export const notifyCertificateEarned = async (userId: string, courseTitle: string, credentialId: string) => {
  playSound('success');
  return createNotification(userId, {
    title: '📜 Certificate Earned!',
    message: `Your certificate for "${courseTitle}" is now available. Credential ID: ${credentialId.slice(0, 8)}...`,
    type: 'success',
    category: 'certificate',
    priority: 'high',
    link: `/verify-certificate?id=${credentialId}`,
    action_url: `/verify-certificate?id=${credentialId}`
  });
};

// Enhanced Payment notification with payment method
export const notifyPayment = async (
  userId: string, 
  amount: number, 
  courseName: string,
  paymentMethod?: string
) => {
  playSound('success');
  const methodDisplay = paymentMethod ? ` using ${paymentMethod}` : '';
  
  return createNotification(userId, {
    title: '💳 Payment Successful',
    message: `Dear, you have successfully enrolled to "${courseName}" by paying $${amount.toFixed(2)}${methodDisplay}.`,
    type: 'success',
    category: 'payment',
    priority: 'high',
    metadata: { amount, courseName, paymentMethod },
  }, {
    playSound: true,
    soundType: 'success',
    speakMessage: true,
    voiceMessage: `Payment successful! You have successfully enrolled to ${courseName} for ${amount.toFixed(2)} dollars${methodDisplay}.`
  });
};

// Admin payment notification (when a student pays)
export const notifyAdminPayment = async (
  adminUserId: string,
  studentName: string,
  studentCountry: string,
  courseName: string,
  courseLevel: string,
  amount: number,
  paymentMethod: string
) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  playSound('success');
  
  return createNotification(adminUserId, {
    title: '💰 Payment Received!',
    message: `Dear Victor Admin, congratulations! You have successfully received payment for new student ${studentName} (${studentCountry}) for the ${courseLevel} course "${courseName}" - $${amount.toFixed(2)} via ${paymentMethod}. ${dateStr}`,
    type: 'success',
    category: 'payment',
    priority: 'high',
    metadata: { 
      studentName, 
      studentCountry, 
      courseName, 
      courseLevel, 
      amount, 
      paymentMethod,
      receivedAt: now.toISOString()
    },
    link: '/admin/revenue'
  }, {
    playSound: true,
    soundType: 'success',
    speakMessage: true,
    voiceMessage: `Payment received! You have received ${amount.toFixed(2)} dollars from ${studentName} for the ${courseLevel} course ${courseName}.`
  });
};

// Teacher payment notification (when they receive revenue)
export const notifyTeacherPayment = async (
  teacherUserId: string,
  courseName: string,
  amount: number,
  studentName: string
) => {
  playSound('success');
  
  return createNotification(teacherUserId, {
    title: '💰 Course Sale Revenue!',
    message: `Great news! You earned $${amount.toFixed(2)} from "${courseName}" - new enrollment by ${studentName}.`,
    type: 'success',
    category: 'payment',
    priority: 'high',
    metadata: { courseName, amount, studentName },
    link: '/teacher/dashboard?tab=earnings'
  }, {
    playSound: true,
    soundType: 'success',
    speakMessage: true,
    voiceMessage: `You earned ${amount.toFixed(2)} dollars from your course ${courseName}!`
  });
};

// Withdrawal notification
export const notifyWithdrawal = async (userId: string, amount: number, status: 'pending' | 'approved' | 'rejected') => {
  const messages = {
    pending: `Your withdrawal request for $${amount.toFixed(2)} is pending review.`,
    approved: `Your withdrawal request for $${amount.toFixed(2)} has been approved!`,
    rejected: `Your withdrawal request for $${amount.toFixed(2)} was rejected. Check details.`
  };
  const types = { pending: 'info', approved: 'success', rejected: 'error' } as const;
  
  if (status === 'approved') playSound('success');
  else if (status === 'rejected') playSound('error');
  else playSound('info');
  
  return createNotification(userId, {
    title: status === 'approved' ? '💰 Withdrawal Approved!' : 
           status === 'rejected' ? '❌ Withdrawal Rejected' : '⏳ Withdrawal Pending',
    message: messages[status],
    type: types[status],
    category: 'withdrawal',
    priority: status === 'rejected' ? 'high' : 'normal',
    link: '/dashboard?tab=withdrawals'
  }, {
    speakMessage: status === 'approved',
    voiceMessage: status === 'approved' ? `Your withdrawal of ${amount.toFixed(2)} dollars has been approved!` : undefined
  });
};

// Login notification
export const notifyLogin = async (userId: string) => {
  playSound('info');
  return createNotification(userId, {
    title: '👋 Welcome Back!',
    message: `You have successfully logged in. Last login: ${new Date().toLocaleString()}`,
    type: 'info',
    category: 'auth',
    priority: 'low',
  });
};

// Sign up notification
export const notifySignUp = async (userId: string, userName: string) => {
  playSound('success');
  return createNotification(userId, {
    title: '🎊 Welcome to EduVerse!',
    message: `Hi ${userName}! Your account has been created successfully. Start exploring courses!`,
    type: 'success',
    category: 'auth',
    priority: 'high',
    link: '/courses',
    action_url: '/courses'
  }, {
    speakMessage: true,
    voiceMessage: `Welcome to EduVerse, ${userName}! Your account has been created successfully.`
  });
};

export const useNotifications = () => {
  return {
    createNotification,
    notifyEnrollment,
    notifyCourseCompletion,
    notifyCertificateEarned,
    notifyPayment,
    notifyAdminPayment,
    notifyTeacherPayment,
    notifyWithdrawal,
    notifyLogin,
    notifySignUp,
    playSound,
    speakNotification
  };
};

export default useNotifications;
