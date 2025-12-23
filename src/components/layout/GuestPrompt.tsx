import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GraduationCap, LogIn, UserPlus, ArrowRight, Lock } from "lucide-react";

interface GuestPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: string;
}

export function GuestPrompt({ open, onOpenChange, action = "access this feature" }: GuestPromptProps) {
  const navigate = useNavigate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4"
          >
            <Lock className="w-8 h-8 text-accent" />
          </motion.div>
          <DialogTitle className="text-xl">Sign In Required</DialogTitle>
          <DialogDescription className="text-base">
            Please sign in or create an account to {action}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <Button
            variant="accent"
            className="w-full"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth");
            }}
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            size="lg"
            onClick={() => {
              onOpenChange(false);
              navigate("/auth?mode=signup");
            }}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Create Free Account
          </Button>
        </div>

        <div className="mt-4 p-4 rounded-lg bg-muted/50">
          <h4 className="font-semibold text-sm mb-2">Why create an account?</h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Access 6,000+ free courses
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Earn verified certificates
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Track your learning progress
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
              Get personalized recommendations
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to use guest prompt
export function useGuestPrompt() {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState("access this feature");

  const showPrompt = (actionText?: string) => {
    if (actionText) setAction(actionText);
    setIsOpen(true);
  };

  const hidePrompt = () => setIsOpen(false);

  const GuestPromptComponent = () => (
    <GuestPrompt open={isOpen} onOpenChange={setIsOpen} action={action} />
  );

  return { showPrompt, hidePrompt, GuestPromptComponent, isOpen };
}
