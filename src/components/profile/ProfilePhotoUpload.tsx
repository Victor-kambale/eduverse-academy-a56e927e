import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Camera, Upload, X, ZoomIn, RotateCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProfilePhotoUploadProps {
  userId: string;
  currentPhotoUrl?: string | null;
  userName?: string;
  onPhotoUpdated?: (url: string) => void;
  disabled?: boolean;
  disabledReason?: string;
}

export function ProfilePhotoUpload({
  userId,
  currentPhotoUrl,
  userName = 'User',
  onPhotoUpdated,
  disabled = false,
  disabledReason,
}: ProfilePhotoUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState([1]);
  const [rotation, setRotation] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getInitials = () => {
    return userName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsDialogOpen(true);
      setZoom([1]);
      setRotation(0);
    }
  };

  const processAndUpload = useCallback(async () => {
    if (!selectedFile || !previewUrl) return;
    setUploading(true);

    try {
      // Create canvas for image processing
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = previewUrl;
      });

      // Set canvas size (square for profile photos)
      const size = 400;
      canvas.width = size;
      canvas.height = size;

      if (ctx) {
        // Clear and fill with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Apply transformations
        ctx.translate(size / 2, size / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(zoom[0], zoom[0]);
        ctx.translate(-size / 2, -size / 2);

        // Calculate dimensions to cover the canvas
        const aspectRatio = img.width / img.height;
        let drawWidth = size;
        let drawHeight = size;

        if (aspectRatio > 1) {
          drawHeight = size;
          drawWidth = size * aspectRatio;
        } else {
          drawWidth = size;
          drawHeight = size / aspectRatio;
        }

        const drawX = (size - drawWidth) / 2;
        const drawY = (size - drawHeight) / 2;

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      }

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Failed to create blob'));
          },
          'image/jpeg',
          0.9
        );
      });

      // Upload to Supabase Storage
      const fileName = `${userId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast.success('Profile photo updated successfully!');
      onPhotoUpdated?.(urlData.publicUrl);
      setIsDialogOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  }, [selectedFile, previewUrl, zoom, rotation, userId, onPhotoUpdated]);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <>
      <div className="relative group">
        <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
          <AvatarImage src={currentPhotoUrl || undefined} />
          <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        {!disabled && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="h-8 w-8 text-white" />
          </button>
        )}
        {disabled && disabledReason && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-destructive">
            {disabledReason}
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile Photo</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Preview */}
            <div className="relative aspect-square w-full max-w-[300px] mx-auto overflow-hidden rounded-full border-4 border-muted">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${zoom[0]}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                />
              )}
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </span>
                  <span>{(zoom[0] * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={zoom}
                  onValueChange={setZoom}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <Button
                variant="outline"
                onClick={handleRotate}
                className="w-full"
              >
                <RotateCw className="h-4 w-4 mr-2" />
                Rotate 90°
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={processAndUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </>
              )}
            </Button>
          </DialogFooter>

          <canvas ref={canvasRef} className="hidden" />
        </DialogContent>
      </Dialog>
    </>
  );
}
