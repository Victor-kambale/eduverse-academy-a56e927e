import { useState, useCallback } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  X, 
  AlertTriangle,
  Download,
  Loader2,
  Eye,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useDropzone } from 'react-dropzone';

interface ParsedCourse {
  id: number;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration_hours: number;
  instructor_name: string;
  status: 'valid' | 'error' | 'warning';
  errors: string[];
}

interface BulkCourseImportProps {
  universityId: string;
}

export const BulkCourseImport = ({ universityId }: BulkCourseImportProps) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedCourses, setParsedCourses] = useState<ParsedCourse[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFile(file);
      parseCSV(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxFiles: 1,
  });

  const parseCSV = async (file: File) => {
    const text = await file.text();
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const courses: ParsedCourse[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const errors: string[] = [];

      const title = values[headers.indexOf('title')] || '';
      const description = values[headers.indexOf('description')] || '';
      const category = values[headers.indexOf('category')] || '';
      const level = values[headers.indexOf('level')] || '';
      const price = parseFloat(values[headers.indexOf('price')]) || 0;
      const duration = parseInt(values[headers.indexOf('duration_hours')]) || 0;
      const instructor = values[headers.indexOf('instructor_name')] || '';

      // Validation
      if (!title) errors.push('Title is required');
      if (!description) errors.push('Description is required');
      if (price < 0) errors.push('Price must be positive');
      if (!['beginner', 'intermediate', 'advanced'].includes(level.toLowerCase())) {
        errors.push('Invalid level (use: beginner, intermediate, advanced)');
      }

      courses.push({
        id: i,
        title,
        description,
        category,
        level: level.toLowerCase(),
        price,
        duration_hours: duration,
        instructor_name: instructor,
        status: errors.length > 0 ? 'error' : 'valid',
        errors,
      });
    }

    setParsedCourses(courses);
    setIsPreviewOpen(true);
  };

  const downloadTemplate = () => {
    const template = `title,description,category,level,price,duration_hours,instructor_name
"Introduction to Python","Learn Python programming from scratch","Programming","beginner",49.99,10,"John Doe"
"Advanced JavaScript","Master advanced JS concepts","Programming","advanced",79.99,15,"Jane Smith"`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const removeCourse = (id: number) => {
    setParsedCourses(prev => prev.filter(c => c.id !== id));
  };

  const handleImport = async () => {
    const validCourses = parsedCourses.filter(c => c.status === 'valid');
    
    if (validCourses.length === 0) {
      toast.error('No valid courses to import');
      return;
    }

    setImporting(true);
    setImportProgress(0);

    try {
      for (let i = 0; i < validCourses.length; i++) {
        const course = validCourses[i];
        
        const { error } = await supabase.from('courses').insert({
          title: course.title,
          description: course.description,
          category: course.category,
          level: course.level,
          price: course.price,
          duration_hours: course.duration_hours,
          instructor_id: user?.id,
          instructor_name: course.instructor_name || user?.email,
          is_published: false,
        });

        if (error) {
          console.error('Error importing course:', error);
        }

        setImportProgress(((i + 1) / validCourses.length) * 100);
      }

      setImportComplete(true);
      toast.success(`Successfully imported ${validCourses.length} courses!`);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import courses');
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedCourses.filter(c => c.status === 'valid').length;
  const errorCount = parsedCourses.filter(c => c.status === 'error').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Course Import
          </CardTitle>
          <CardDescription>
            Import multiple courses at once using a CSV file
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h4 className="font-medium">Download CSV Template</h4>
              <p className="text-sm text-muted-foreground">
                Use this template to prepare your course data
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-accent bg-accent/5' 
                : 'border-border hover:border-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-accent font-medium">Drop your file here...</p>
            ) : (
              <>
                <p className="font-medium mb-1">Drag & drop your CSV file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Supports: CSV, XLS, XLSX
            </p>
          </div>

          {file && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <span className="font-medium">{file.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsPreviewOpen(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Course Import Preview</DialogTitle>
          </DialogHeader>

          {importing ? (
            <div className="py-8 space-y-4">
              <div className="text-center">
                {importComplete ? (
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                ) : (
                  <Loader2 className="h-16 w-16 mx-auto text-accent animate-spin mb-4" />
                )}
                <h3 className="text-xl font-medium">
                  {importComplete ? 'Import Complete!' : 'Importing Courses...'}
                </h3>
                <p className="text-muted-foreground">
                  {importComplete 
                    ? `Successfully imported ${validCount} courses`
                    : 'Please wait while we create your courses'}
                </p>
              </div>
              <Progress value={importProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(importProgress)}% complete
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 py-2">
                <Badge variant="secondary" className="text-sm">
                  {parsedCourses.length} courses found
                </Badge>
                {validCount > 0 && (
                  <Badge className="bg-green-500 text-sm">
                    <Check className="h-3 w-3 mr-1" />
                    {validCount} valid
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    <X className="h-3 w-3 mr-1" />
                    {errorCount} errors
                  </Badge>
                )}
              </div>

              <div className="overflow-auto flex-1">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedCourses.map((course) => (
                      <TableRow key={course.id} className={course.status === 'error' ? 'bg-red-50' : ''}>
                        <TableCell>
                          {course.status === 'valid' ? (
                            <Check className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{course.title || '(No title)'}</p>
                            {course.errors.length > 0 && (
                              <p className="text-xs text-destructive">
                                {course.errors.join(', ')}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{course.category || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {course.level || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>${course.price.toFixed(2)}</TableCell>
                        <TableCell>{course.duration_hours}h</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          <DialogFooter>
            {importComplete ? (
              <Button onClick={() => {
                setIsPreviewOpen(false);
                setFile(null);
                setParsedCourses([]);
                setImportComplete(false);
              }}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={validCount === 0 || importing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import {validCount} Course{validCount !== 1 ? 's' : ''}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
