import { useState, useRef } from 'react';
import { Download, Upload, FileText, Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BulkImportExportProps {
  entityType: 'testimonials' | 'gift_cards';
  onImportComplete?: () => void;
}

interface ImportPreviewRow {
  data: Record<string, any>;
  valid: boolean;
  errors: string[];
}

const testimonialHeaders = [
  'name', 'role', 'country_code', 'country_emoji', 'rating', 'testimonial_text',
  'photo_url', 'video_url', 'testimonial_type', 'social_facebook', 'social_twitter',
  'social_linkedin', 'social_instagram', 'is_active', 'sort_order'
];

const giftCardHeaders = [
  'name', 'gradient', 'category', 'icon', 'is_active', 'is_disabled', 'sort_order'
];

export function BulkImportExport({ entityType, onImportComplete }: BulkImportExportProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportPreviewRow[]>([]);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const headers = entityType === 'testimonials' ? testimonialHeaders : giftCardHeaders;

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data, error } = await supabase
        .from(entityType)
        .select('*')
        .order('sort_order');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error(`No ${entityType} found to export`);
        return;
      }

      // Create CSV content
      const csvHeaders = headers.join(',');
      const csvRows = data.map(row => 
        headers.map(h => {
          const value = row[h as keyof typeof row];
          if (value === null || value === undefined) return '';
          if (typeof value === 'boolean') return value ? 'true' : 'false';
          if (typeof value === 'string' && value.includes(',')) return `"${value}"`;
          return String(value);
        }).join(',')
      );

      const csvContent = [csvHeaders, ...csvRows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityType}-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success(`Exported ${data.length} ${entityType}`);
    } catch (error: any) {
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      toast.error('CSV file is empty or has no data rows');
      return;
    }

    const headerLine = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Validate headers
    const missingHeaders = headers.filter(h => !headerLine.includes(h));
    if (missingHeaders.length > 0) {
      toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
      return;
    }

    const preview: ImportPreviewRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, any> = {};
      const errors: string[] = [];

      headerLine.forEach((header, index) => {
        const value = values[index]?.trim().replace(/^"|"$/g, '') || '';
        
        if (header === 'rating' || header === 'sort_order') {
          row[header] = parseInt(value) || 0;
        } else if (header === 'is_active' || header === 'is_disabled') {
          row[header] = value.toLowerCase() === 'true';
        } else {
          row[header] = value || null;
        }
      });

      // Validation
      if (!row.name) errors.push('Name is required');
      if (entityType === 'testimonials') {
        if (!row.testimonial_text && row.testimonial_type !== 'video') {
          errors.push('Testimonial text is required');
        }
      }

      preview.push({
        data: row,
        valid: errors.length === 0,
        errors,
      });
    }

    setImportPreview(preview);
    setShowImportDialog(true);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };

  const handleImport = async () => {
    const validRows = importPreview.filter(r => r.valid);
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    setImporting(true);
    try {
      const dataToInsert = validRows.map(r => {
        const { id, created_at, updated_at, ...rest } = r.data;
        return rest;
      });

      const { error } = await supabase
        .from(entityType)
        .insert(dataToInsert as any);

      if (error) throw error;

      toast.success(`Successfully imported ${validRows.length} ${entityType}`);
      setShowImportDialog(false);
      setImportPreview([]);
      setFileName('');
      onImportComplete?.();
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${entityType}-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Template downloaded');
  };

  const validCount = importPreview.filter(r => r.valid).length;
  const invalidCount = importPreview.filter(r => !r.valid).length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Bulk Import/Export
          </CardTitle>
          <CardDescription>
            Import or export {entityType.replace('_', ' ')} using CSV files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export All
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </CardContent>
      </Card>

      {/* Import Preview Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Import Preview: {fileName}</DialogTitle>
            <DialogDescription>
              Review the data before importing. Invalid rows will be skipped.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-4 my-4">
            <Badge variant="default" className="bg-green-500">
              <Check className="h-3 w-3 mr-1" />
              {validCount} Valid
            </Badge>
            <Badge variant="destructive">
              <X className="h-3 w-3 mr-1" />
              {invalidCount} Invalid
            </Badge>
          </div>

          <ScrollArea className="h-[400px] border rounded-lg scroll-smooth">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Name</th>
                  {entityType === 'testimonials' && <th className="p-2 text-left">Text</th>}
                  {entityType === 'gift_cards' && <th className="p-2 text-left">Category</th>}
                  <th className="p-2 text-left">Errors</th>
                </tr>
              </thead>
              <tbody>
                {importPreview.map((row, index) => (
                  <tr key={index} className={row.valid ? '' : 'bg-red-500/10'}>
                    <td className="p-2">
                      {row.valid ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </td>
                    <td className="p-2">{row.data.name || '-'}</td>
                    {entityType === 'testimonials' && (
                      <td className="p-2 max-w-[200px] truncate">
                        {row.data.testimonial_text || '-'}
                      </td>
                    )}
                    {entityType === 'gift_cards' && (
                      <td className="p-2">{row.data.category || '-'}</td>
                    )}
                    <td className="p-2 text-red-500 text-xs">
                      {row.errors.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowImportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport} disabled={importing || validCount === 0}>
              {importing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Import {validCount} Rows
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
