import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, X, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface CookieConsentProps {
  onAccept?: () => void;
  onDecline?: () => void;
}

export const CookieConsent = ({ onAccept, onDecline }: CookieConsentProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setIsVisible(false);
    onDecline?.();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-fade-in">
      <Card className="shadow-xl border-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-accent" />
              <CardTitle className="text-lg">Cookies Notice</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDecline}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <CardDescription>
            Skip to main content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cookies must be enabled in your browser to use this site.
          </p>
          
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button variant="link" className="p-0 h-auto text-accent">
                <Info className="w-4 h-4 mr-1" />
                Learn about cookies used
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Cookie className="w-5 h-5" />
                  Two cookies are used on this site
                </DialogTitle>
              </DialogHeader>
              <DialogDescription asChild>
                <div className="space-y-4 text-sm">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Session Cookie (EduVerseSession)</h4>
                    <p className="text-muted-foreground">
                      The essential one is the session cookie. You must allow this cookie in your browser to provide 
                      continuity and to remain logged in when browsing the site. When you log out or close the browser, 
                      this cookie is destroyed (in your browser and on the server).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Convenience Cookie (EDUVERSEID)</h4>
                    <p className="text-muted-foreground">
                      The other cookie is purely for convenience. It just remembers your username in the browser. 
                      This means that when you return to this site, the username field on the login page is already 
                      filled in for you. It is safe to refuse this cookie - you will just have to retype your username 
                      each time you log in.
                    </p>
                  </div>
                </div>
              </DialogDescription>
            </DialogContent>
          </Dialog>

          <div className="flex gap-2">
            <Button onClick={handleAccept} className="flex-1" variant="accent">
              Accept Cookies
            </Button>
            <Button onClick={handleDecline} variant="outline" className="flex-1">
              Decline
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
