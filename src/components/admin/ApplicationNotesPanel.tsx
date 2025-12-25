import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Clock,
  Trash2,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';

interface ApplicationNote {
  id: string;
  application_id: string;
  admin_id: string;
  note: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
}

interface ApplicationNotesPanelProps {
  applicationId: string;
  className?: string;
}

export default function ApplicationNotesPanel({ 
  applicationId,
  className = ''
}: ApplicationNotesPanelProps) {
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
    getCurrentAdmin();
  }, [applicationId]);

  const getCurrentAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setAdminId(user?.id || null);
  };

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('university_application_notes')
        .select('*')
        .eq('application_id', applicationId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newNote.trim() || !adminId) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('university_application_notes')
        .insert({
          application_id: applicationId,
          admin_id: adminId,
          note: newNote.trim(),
          is_internal: true
        });

      if (error) throw error;

      toast.success('Note added successfully');
      setNewNote('');
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('university_application_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast.success('Note deleted');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Admin Notes</h3>
        <Badge variant="secondary" className="ml-auto">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'}
        </Badge>
      </div>

      {/* New Note Input */}
      <div className="space-y-2 mb-4">
        <Textarea
          placeholder="Add an internal note about this application..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
          className="resize-none text-sm"
        />
        <Button
          onClick={handleSubmit}
          disabled={!newNote.trim() || submitting}
          size="sm"
          className="w-full sm:w-auto"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Add Note
            </>
          )}
        </Button>
      </div>

      <Separator className="my-2" />

      {/* Notes List */}
      <ScrollArea className="flex-1 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs">Add the first note about this application</p>
          </div>
        ) : (
          <div className="space-y-3 pr-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-muted/50 border border-border/50 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>Admin</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span title={format(new Date(note.created_at), 'PPpp')}>
                      {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  {note.admin_id === adminId && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Note</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this note? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(note.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <p className="text-sm whitespace-pre-wrap break-words">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
