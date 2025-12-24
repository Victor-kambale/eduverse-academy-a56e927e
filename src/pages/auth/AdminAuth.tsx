import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminKey: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', data.user?.id)
        .eq('role', 'admin')
        .single();

      if (roleData) {
        toast.success('Welcome, Administrator!');
        navigate('/admin');
      } else {
        toast.error('Access denied. Admin privileges required.');
        await supabase.auth.signOut();
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl bg-slate-800/90 text-white">
          <CardHeader className="text-center pb-2">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center"
            >
              <Shield className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-white">Admin Pro Portal</CardTitle>
            <CardDescription className="text-slate-400">
              Secure access for platform administrators only
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Alert className="mb-6 bg-amber-500/10 border-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-200 text-sm">
                This is a restricted area. Unauthorized access attempts are logged and monitored.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Admin Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@eduverse.com"
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
                    className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminKey" className="text-slate-300">Admin Security Key (Optional)</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="adminKey"
                    type="password"
                    placeholder="Enter if 2FA enabled"
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    value={formData.adminKey}
                    onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600" 
                disabled={isLoading}
              >
                {isLoading ? 'Authenticating...' : 'Secure Login'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-xs text-slate-500 text-center">
                🔒 All login attempts are monitored and recorded for security purposes.
                <br />
                Unauthorized access is a violation of EduVerse security policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
