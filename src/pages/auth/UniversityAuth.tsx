import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Globe,
  Users,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function UniversityAuth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    institutionName: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });
      
      if (error) throw error;
      toast.success('Welcome back!');
      navigate('/university/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.institutionName,
            institution_type: 'university'
          },
          emailRedirectTo: `${window.location.origin}/university/register`
        }
      });
      
      if (error) throw error;
      toast.success('Account created! Complete your institution registration.');
      navigate('/university/register');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-background dark:via-background dark:to-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 dark:bg-card/90">
          <CardHeader className="text-center pb-2">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center"
            >
              <Building2 className="h-10 w-10 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">University Portal</CardTitle>
            <CardDescription>
              Partner with EduVerse to expand your institution's reach
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="login" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Partner With Us</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Institution Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@university.edu"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In to Institution'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="institutionName">Institution Name</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="institutionName"
                        placeholder="Harvard University"
                        className="pl-10"
                        value={formData.institutionName}
                        onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail">Official Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupEmail"
                        type="email"
                        placeholder="admin@university.edu"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signupPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Start Partnership'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center mb-3">Partnership Benefits</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2">
                  <Globe className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                  <p className="text-xs">Global Reach</p>
                </div>
                <div className="p-2">
                  <Users className="h-5 w-5 mx-auto text-indigo-500 mb-1" />
                  <p className="text-xs">50M+ Learners</p>
                </div>
                <div className="p-2">
                  <Award className="h-5 w-5 mx-auto text-amber-500 mb-1" />
                  <p className="text-xs">Accreditation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
