import { useEffect } from 'react';
import { toast } from 'sonner';

interface CopyProtectionProps {
  children: React.ReactNode;
  showWarning?: boolean;
}

export const CopyProtection = ({ children, showWarning = true }: CopyProtectionProps) => {
  useEffect(() => {
    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (showWarning) {
        toast.error("Content copying is disabled due to security policy.");
      }
    };

    // Prevent context menu (right-click)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (showWarning) {
        toast.error("Right-click is disabled due to security policy.");
      }
    };

    // Prevent keyboard shortcuts for copying
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S, Ctrl+U
      if (e.ctrlKey || e.metaKey) {
        if (['c', 'x', 'a', 'p', 's', 'u'].includes(e.key.toLowerCase())) {
          e.preventDefault();
          if (showWarning) {
            toast.error("This action is disabled due to security policy.");
          }
        }
      }
      
      // Prevent Print Screen key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        // Try to clear clipboard
        navigator.clipboard.writeText('').catch(() => {});
        if (showWarning) {
          toast.error("Screenshots are disabled due to security policy.");
        }
      }
      
      // Prevent F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        if (showWarning) {
          toast.error("Developer tools are disabled due to security policy.");
        }
      }
    };

    // Prevent drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // Prevent selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
    };

    // Detect visibility change (possible screenshot attempt)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, could be screenshot attempt
        document.body.classList.add('blur-protection');
      } else {
        document.body.classList.remove('blur-protection');
      }
    };

    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Add CSS to prevent text selection and add screenshot blur
    const style = document.createElement('style');
    style.id = 'copy-protection-styles';
    style.textContent = `
      .no-select, .no-select * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
      }
      .blur-protection {
        filter: blur(10px) !important;
        transition: filter 0.1s ease;
      }
      @media print {
        .no-select, .no-select * {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      const existingStyle = document.getElementById('copy-protection-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      document.body.classList.remove('blur-protection');
    };
  }, [showWarning]);

  return (
    <div className="no-select" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
      {children}
    </div>
  );
};