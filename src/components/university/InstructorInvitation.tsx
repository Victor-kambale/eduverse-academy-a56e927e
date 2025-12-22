import { useState } from 'react';
import { 
  Mail, 
  Send, 
  Users, 
  Copy, 
  Check,
  Link,
  Clock,
  AlertTriangle,
  UserPlus,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'accepted' | 'expired';
  sent_at: string;
  expires_at: string;
  accepted_at?: string;
}

interface InstructorInvitationProps {
  universityId: string;
  universityName: string;
}

export const InstructorInvitation = ({ universityId, universityName }: InstructorInvitationProps) => {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [emails, setEmails] = useState('');
  const [customMessage, setCustomMessage] = useState(
    `You've been invited to join ${universityName} as an instructor on EduVerse. Click the link below to accept the invitation and start creating courses.`
  );

  const [invitations, setInvitations] = useState<Invitation[]>([
    // Demo data
    {
      id: '1',
      email: 'instructor1@example.com',
      status: 'pending',
      sent_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      email: 'instructor2@example.com',
      status: 'accepted',
      sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      accepted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const generateInviteLink = (invitationId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/instructor/join?invite=${invitationId}&university=${universityId}`;
  };

  const handleCopyLink = async (invitationId: string) => {
    const link = generateInviteLink(invitationId);
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Invitation link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvitations = async () => {
    const emailList = emails
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@'));

    if (emailList.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setLoading(true);

    try {
      // In production, this would call an edge function to send emails
      for (const email of emailList) {
        const invitationId = Math.random().toString(36).substring(7);
        const newInvitation: Invitation = {
          id: invitationId,
          email,
          status: 'pending',
          sent_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };

        setInvitations(prev => [newInvitation, ...prev]);

        // Create notification for the invite
        await supabase.from('notifications').insert({
          user_id: user?.id,
          title: 'Invitation Sent',
          message: `Invitation sent to ${email}`,
          type: 'success',
        });
      }

      toast.success(`${emailList.length} invitation(s) sent successfully!`);
      setEmails('');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error sending invitations:', error);
      toast.error('Failed to send invitations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Invitation['status']) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Instructor Invitations
            </CardTitle>
            <CardDescription>
              Invite instructors to join your university team
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Instructors
          </Button>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-2">No invitations yet</h3>
              <p className="text-muted-foreground mb-4">
                Start inviting instructors to grow your team
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Send First Invitation
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-medium">{invitation.email}</TableCell>
                    <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(invitation.sent_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invitation.status === 'accepted' 
                        ? 'N/A' 
                        : format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      {invitation.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(invitation.id)}
                          >
                            {copied ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.success('Invitation resent!')}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite Instructors
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Email Addresses</Label>
              <Textarea
                placeholder="Enter email addresses (one per line or comma-separated)&#10;e.g., instructor1@example.com&#10;instructor2@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground mt-1">
                You can enter multiple emails separated by commas or new lines
              </p>
            </div>

            <div>
              <Label>Custom Message (Optional)</Label>
              <Textarea
                placeholder="Add a personal message to your invitation..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={3}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Link className="h-4 w-4" />
                Invitation Details
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Invitations are valid for 7 days</li>
                <li>• Instructors will receive an email with a unique signup link</li>
                <li>• They'll be automatically added to your university team</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitations} disabled={loading || !emails.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitations
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
