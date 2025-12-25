import { useState, useEffect } from 'react';
import { User, Camera, Save, Loader2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TeacherProfile {
  full_name: string;
  email: string;
  phone: string | null;
  country: string;
  bio: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  photo_url: string | null;
  specializations: string[];
}

export function TeacherProfileEditor() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    }
  }, [user?.id]);

  const fetchProfile = async () => {
    if (!user?.id) return;
    
    const { data, error } = await supabase
      .from('teacher_applications')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!error && data) {
      setProfile({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        bio: data.bio,
        website_url: data.website_url,
        linkedin_url: data.linkedin_url,
        photo_url: data.photo_url,
        specializations: data.specializations || [],
      });
    }
    setLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, or WebP image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const filePath = `teacher-photos/${user.id}/${Date.now()}.${file.name.split('.').pop()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('teacher-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('teacher-documents')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('teacher_applications')
        .update({ photo_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, photo_url: urlData.publicUrl } : null);
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id || !profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('teacher_applications')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          bio: profile.bio,
          website_url: profile.website_url,
          linkedin_url: profile.linkedin_url,
          specializations: profile.specializations,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="pt-6 flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-slate-800/50 border-purple-500/20">
        <CardContent className="pt-6 text-center text-muted-foreground">
          <p>No profile found. Please complete your teacher registration first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-purple-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="h-5 w-5 text-purple-400" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] scroll-smooth pr-4">
          <div className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                  <AvatarImage src={profile.photo_url || undefined} />
                  <AvatarFallback className="bg-purple-600 text-white text-2xl">
                    {profile.full_name?.charAt(0) || 'T'}
                  </AvatarFallback>
                </Avatar>
                <label 
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <p className="text-sm text-muted-foreground">Click camera icon to upload photo</p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label className="text-purple-200">Full Name</Label>
                <Input
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>

              <div>
                <Label className="text-purple-200 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  value={profile.email}
                  disabled
                  className="bg-slate-700/50 border-purple-500/30 opacity-60"
                />
              </div>

              <div>
                <Label className="text-purple-200 flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone
                </Label>
                <Input
                  value={profile.phone || ''}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>

              <div>
                <Label className="text-purple-200 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Country
                </Label>
                <Input
                  value={profile.country}
                  disabled
                  className="bg-slate-700/50 border-purple-500/30 opacity-60"
                />
              </div>

              <div>
                <Label className="text-purple-200 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </Label>
                <Input
                  value={profile.website_url || ''}
                  onChange={(e) => setProfile({ ...profile, website_url: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-purple-200">LinkedIn URL</Label>
                <Input
                  value={profile.linkedin_url || ''}
                  onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>

              <div className="md:col-span-2">
                <Label className="text-purple-200">Bio</Label>
                <Textarea
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell students about yourself, your experience, and teaching style..."
                  rows={4}
                  className="bg-slate-700/50 border-purple-500/30"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
