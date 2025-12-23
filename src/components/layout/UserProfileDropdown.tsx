import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  GraduationCap,
  Award,
  Star,
  Briefcase,
  FileText,
  HelpCircle,
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  Trophy,
  Sparkles,
  Share2,
  History,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileData {
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export function UserProfileDropdown() {
  const { user, signOut } = useAuth();
  const { isAdmin, isInstructor } = useUserRole();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [xp, setXp] = useState(1185); // Mock XP - would fetch from DB
  const [profileCompletion, setProfileCompletion] = useState(63); // Mock completion %

  // Fetch profile on open
  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && user && !profile) {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, email")
        .eq("user_id", user.id)
        .single();
      if (data) setProfile(data);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  const displayEmail = profile?.email || user?.email || "";
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;
  const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative flex items-center gap-2 px-2 h-auto py-1">
          <Avatar className="h-9 w-9 border-2 border-accent/50">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-accent/20 text-accent-foreground font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" sideOffset={8}>
        {/* Profile Header */}
        <div className="p-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="flex items-start gap-3">
            <Avatar className="h-14 w-14 border-2 border-accent">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="bg-accent/20 text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-foreground truncate">{displayName}</h3>
              <p className="text-sm text-muted-foreground truncate">{displayEmail}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  Administrator
                </span>
              )}
              {isInstructor && !isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  <GraduationCap className="h-3 w-3" />
                  Instructor
                </span>
              )}
            </div>
          </div>
          
          {/* Profile Completion */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Profile Completion</span>
              <span className="text-xs font-bold text-accent">{profileCompletion}%</span>
            </div>
            <Progress value={profileCompletion} className="h-2" />
            {profileCompletion < 100 && (
              <Link 
                to="/dashboard?tab=profile" 
                className="text-xs text-accent hover:underline mt-1 inline-block"
                onClick={() => setOpen(false)}
              >
                Finish Your Profile →
              </Link>
            )}
          </div>

          {/* XP Display */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-yellow-600">{xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Quick Actions */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=certificates" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Award className="h-4 w-4 text-accent" />
              <span>Claim Your Certificates</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Your Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=courses" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <BookOpen className="h-4 w-4" />
              <span>My Courses</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=achievements" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Trophy className="h-4 w-4" />
              <span>Your Achievements</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <Separator />

        {/* Career & Profile */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">Career & Profile</DropdownMenuLabel>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=recommendations" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Sparkles className="h-4 w-4" />
              <span>Recommended For You</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=career" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Briefcase className="h-4 w-4" />
              <span>Career Ready Plan</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=resume" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <FileText className="h-4 w-4" />
              <span>Your Resumé/CV</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=affiliate" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Share2 className="h-4 w-4" />
              <span>Affiliate Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=history" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <History className="h-4 w-4" />
              <span>Order History</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <Separator />

        {/* Account & Support */}
        <DropdownMenuGroup className="p-2">
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/dashboard?tab=settings" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <Settings className="h-4 w-4" />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link to="/help" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <HelpCircle className="h-4 w-4" />
              <span>FAQs</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <Separator />

        {/* Logout */}
        <div className="p-2">
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
