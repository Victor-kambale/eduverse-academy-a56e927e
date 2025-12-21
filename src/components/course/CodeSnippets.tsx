import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Check, Code, FileCode } from 'lucide-react';
import { toast } from 'sonner';

interface CodeSnippet {
  id: string;
  title: string;
  description: string | null;
  language: string;
  code: string;
  sort_order: number;
}

interface CodeSnippetsProps {
  courseId: string;
  lessonId?: string;
}

const languageColors: Record<string, string> = {
  javascript: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
  typescript: 'bg-blue-500/20 text-blue-700 dark:text-blue-400',
  python: 'bg-green-500/20 text-green-700 dark:text-green-400',
  html: 'bg-orange-500/20 text-orange-700 dark:text-orange-400',
  css: 'bg-pink-500/20 text-pink-700 dark:text-pink-400',
  java: 'bg-red-500/20 text-red-700 dark:text-red-400',
  sql: 'bg-purple-500/20 text-purple-700 dark:text-purple-400',
  bash: 'bg-gray-500/20 text-gray-700 dark:text-gray-400',
  json: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
};

export function CodeSnippets({ courseId, lessonId }: CodeSnippetsProps) {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSnippets();
  }, [courseId, lessonId]);

  const fetchSnippets = async () => {
    try {
      let query = supabase
        .from('code_snippets')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order');

      if (lessonId) {
        query = query.eq('lesson_id', lessonId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSnippets(data || []);
    } catch (error) {
      console.error('Error fetching code snippets:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (code: string, snippetId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(snippetId);
      toast.success('Code copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (snippets.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="w-5 h-5" />
          Code Snippets & Resources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue={snippets[0]?.id} className="w-full">
          <TabsList className="w-full flex-wrap h-auto gap-1 p-1">
            {snippets.map((snippet) => (
              <TabsTrigger
                key={snippet.id}
                value={snippet.id}
                className="flex items-center gap-2"
              >
                <Code className="w-4 h-4" />
                <span className="truncate max-w-[150px]">{snippet.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {snippets.map((snippet) => (
            <TabsContent key={snippet.id} value={snippet.id} className="mt-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className={languageColors[snippet.language] || 'bg-muted'}>
                      {snippet.language}
                    </Badge>
                    {snippet.description && (
                      <span className="text-sm text-muted-foreground">
                        {snippet.description}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(snippet.code, snippet.id)}
                    className="gap-2"
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>

                <div className="relative">
                  <pre className="bg-muted/50 p-4 rounded-lg overflow-x-auto text-sm font-mono border">
                    <code>{snippet.code}</code>
                  </pre>
                </div>

                <p className="text-xs text-muted-foreground">
                  💡 Tip: Copy this code and paste it in your editor (VS Code, Notepad++, etc.)
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
