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
      // Prevent Ctrl+C, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+S
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
        if (showWarning) {
          toast.error("Can't take screenshot due to security policy.");
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

    document.addEventListener('copy', handleCopy);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, [showWarning]);

  return (
    <div className="no-select" style={{ userSelect: 'none' }}>
      {children}
    </div>
  );
};
