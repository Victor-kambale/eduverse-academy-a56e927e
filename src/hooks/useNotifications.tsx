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

export const createNotification = async (
  userId: string,
  data: NotificationData,
  options?: { playSound?: boolean; soundType?: 'success' | 'info' | 'warning' | 'error' }
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
      });

    if (error) throw error;

    if (options?.playSound) {
      playSound(options.soundType || 'info');
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

// Payment notification
export const notifyPayment = async (userId: string, amount: number, courseName: string) => {
  playSound('success');
  return createNotification(userId, {
    title: '💳 Payment Successful',
    message: `Payment of $${amount.toFixed(2)} for "${courseName}" was successful.`,
    type: 'success',
    category: 'payment',
    priority: 'normal',
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
  });
};

export const useNotifications = () => {
  return {
    createNotification,
    notifyEnrollment,
    notifyCourseCompletion,
    notifyCertificateEarned,
    notifyPayment,
    notifyWithdrawal,
    notifyLogin,
    notifySignUp,
    playSound
  };
};

export default useNotifications;
