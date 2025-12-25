import { useState } from 'react';
import { 
  Eye, 
  Palette, 
  Mail,
  Sparkles,
  Save,
  Copy,
  Check,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EmailTemplateData {
  title: string;
  description?: string;
  linkUrl: string;
  linkText: string;
  endDate?: string;
  headerColor?: string;
  ctaColor?: string;
  template?: string;
}

interface EmailTemplatePreviewProps {
  data: EmailTemplateData;
  onTemplateChange?: (template: string) => void;
}

const emailTemplates = {
  default: {
    name: 'Modern Gradient',
    headerGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%)',
    ctaGradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
  },
  professional: {
    name: 'Professional Blue',
    headerGradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    ctaGradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
  },
  warm: {
    name: 'Warm Sunset',
    headerGradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
    ctaGradient: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
  },
  elegant: {
    name: 'Elegant Dark',
    headerGradient: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
    ctaGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  fresh: {
    name: 'Fresh Green',
    headerGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    ctaGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
};

// University-specific email templates
const universityTemplates = {
  application_received: {
    subject: 'Application Received - EduVerse University Partnership',
    content: `Dear {{institution_name}},

Thank you for submitting your application to partner with EduVerse. We have received your application and our team will review it within 5-7 business days.

Application Details:
- Institution: {{institution_name}}
- Country: {{country}}
- Type: {{institution_type}}
- Submitted: {{submission_date}}

What's Next:
1. Our team will review your submitted documents
2. We may contact you for additional information
3. You'll receive a decision notification via email

If you have any questions, please don't hesitate to reach out.

Best regards,
The EduVerse Partnership Team`,
  },
  documents_required: {
    subject: 'Action Required: Additional Documents Needed',
    content: `Dear {{institution_name}},

We are reviewing your university partnership application. To proceed, we need the following additional documents:

{{required_documents}}

Please upload these documents within the next 7 days through your application portal.

Upload Link: {{upload_link}}

If you have any questions, please contact us.

Best regards,
The EduVerse Partnership Team`,
  },
  application_approved: {
    subject: '🎉 Congratulations! Your Application Has Been Approved',
    content: `Dear {{institution_name}},

We are thrilled to inform you that your application to partner with EduVerse has been APPROVED!

Welcome to the EduVerse family. As a partner institution, you now have access to:
- Course creation and management tools
- Student enrollment analytics
- Revenue sharing program
- Dedicated support channel

Next Steps:
1. Sign the partnership agreement
2. Set up your institution profile
3. Start creating courses

Get Started: {{dashboard_link}}

We look forward to a successful partnership!

Best regards,
The EduVerse Partnership Team`,
  },
  application_rejected: {
    subject: 'Application Status Update',
    content: `Dear {{institution_name}},

Thank you for your interest in partnering with EduVerse. After careful review of your application, we regret to inform you that we are unable to approve your partnership request at this time.

Reason: {{rejection_reason}}

You may reapply after addressing the above concerns. If you have questions or would like to discuss this decision, please contact our partnership team.

Best regards,
The EduVerse Partnership Team`,
  },
  under_review: {
    subject: 'Your Application is Under Review',
    content: `Dear {{institution_name}},

Your application is currently under review by our partnership team. We are carefully evaluating your documents and credentials.

Current Status: Under Review
Estimated Review Time: 3-5 business days

We will notify you once a decision has been made. Thank you for your patience.

Best regards,
The EduVerse Partnership Team`,
  },
};

export function EmailTemplatePreview({ data, onTemplateChange }: EmailTemplatePreviewProps) {
  const [selectedStyle, setSelectedStyle] = useState<keyof typeof emailTemplates>(
    (data.template as keyof typeof emailTemplates) || 'default'
  );
  const [selectedUniversityTemplate, setSelectedUniversityTemplate] = useState<keyof typeof universityTemplates>('application_received');
  const [showPreview, setShowPreview] = useState(false);
  const [editedContent, setEditedContent] = useState(universityTemplates.application_received.content);
  const [editedSubject, setEditedSubject] = useState(universityTemplates.application_received.subject);
  const [copied, setCopied] = useState(false);

  const template = emailTemplates[selectedStyle];

  const handleTemplateChange = (value: string) => {
    setSelectedStyle(value as keyof typeof emailTemplates);
    onTemplateChange?.(value);
  };

  const handleUniversityTemplateChange = (value: string) => {
    setSelectedUniversityTemplate(value as keyof typeof universityTemplates);
    const tmpl = universityTemplates[value as keyof typeof universityTemplates];
    setEditedContent(tmpl.content);
    setEditedSubject(tmpl.subject);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editedContent);
    setCopied(true);
    toast.success('Template copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const saveTemplate = () => {
    toast.success('Template saved successfully');
  };

  const formatEndDate = (dateStr?: string) => {
    if (!dateStr) return 'Limited time offer - act now!';
    return `Hurry! This offer ends on ${new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })}`;
  };

  const generateEmailHtml = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <tr>
      <td style="background: ${template.headerGradient}; padding: 40px 24px; text-align: center;">
        <h1 style="margin: 0; color: #ffffff; font-size: 32px; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
          🎉 Special Offer!
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 24px; text-align: center;">
        <h2 style="margin: 0 0 16px 0; color: #1e293b; font-size: 28px; font-weight: bold;">
          ${data.title}
        </h2>
        ${data.description ? `<p style="margin: 0 0 24px 0; color: #64748b; font-size: 18px; line-height: 1.6;">${data.description}</p>` : ''}
        <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
            ⏰ ${formatEndDate(data.endDate)}
          </p>
        </div>
        <a href="${data.linkUrl}" 
           style="display: inline-block; background: ${template.ctaGradient}; color: #ffffff; padding: 18px 40px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 18px; margin: 16px 0; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.4);">
          ${data.linkText} →
        </a>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; background: #0f172a; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
          Eduverse Academy
        </p>
        <p style="margin: 0; color: #64748b; font-size: 11px;">
          <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a> | 
          <a href="#" style="color: #64748b; text-decoration: underline;">Privacy Policy</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="university" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="university" className="text-xs sm:text-sm">University Templates</TabsTrigger>
          <TabsTrigger value="marketing" className="text-xs sm:text-sm">Marketing Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="university" className="space-y-4 mt-4">
          {/* Template Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Select Template</Label>
              <Select value={selectedUniversityTemplate} onValueChange={handleUniversityTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="application_received">Application Received</SelectItem>
                  <SelectItem value="documents_required">Documents Required</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="application_approved">Application Approved</SelectItem>
                  <SelectItem value="application_rejected">Application Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Email Style</Label>
              <Select value={selectedStyle} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emailTemplates).map(([key, value]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ background: value.headerGradient }}
                        />
                        {value.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label className="text-sm">Subject Line</Label>
            <Input
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              placeholder="Email subject..."
            />
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label className="text-sm">Email Content</Label>
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={10}
              className="font-mono text-xs sm:text-sm"
              placeholder="Email content..."
            />
            <p className="text-xs text-muted-foreground">
              Use placeholders like {'{{institution_name}}'}, {'{{country}}'} for dynamic content
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={saveTemplate} size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </Button>
            <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Preview</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Email Preview</DialogTitle>
                </DialogHeader>
                <div className="border rounded-lg overflow-hidden">
                  <div
                    className="p-4 sm:p-6 text-center text-white"
                    style={{ background: template.headerGradient }}
                  >
                    <h2 className="text-lg sm:text-xl font-bold">{editedSubject}</h2>
                  </div>
                  <div className="p-4 sm:p-6 bg-white">
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-700 font-sans">
                      {editedContent}
                    </pre>
                  </div>
                  <div className="p-4 bg-gray-50 text-center text-sm text-gray-500">
                    © {new Date().getFullYear()} EduVerse. All rights reserved.
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </TabsContent>

        <TabsContent value="marketing" className="space-y-4 mt-4">
          {/* Style Selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <Label className="text-sm mb-2 block">Email Template Style</Label>
              <Select value={selectedStyle} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(emailTemplates).map(([key, tmpl]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ background: tmpl.headerGradient }}
                        />
                        {tmpl.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={showPreview} onOpenChange={setShowPreview}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-0 sm:mt-6 w-full sm:w-auto">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Preview
                  </DialogTitle>
                </DialogHeader>
                <div className="overflow-auto max-h-[70vh] rounded-lg border">
                  <div 
                    dangerouslySetInnerHTML={{ __html: generateEmailHtml() }}
                    className="bg-slate-100"
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mini Preview Card */}
          <Card className="overflow-hidden">
            <CardHeader className="p-3" style={{ background: template.headerGradient }}>
              <CardTitle className="text-white text-sm text-center flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 text-center">
              <p className="font-semibold text-sm mb-2 truncate">{data.title || 'Promo Title'}</p>
              <div 
                className="inline-block px-4 py-2 rounded-lg text-white text-xs font-bold"
                style={{ background: template.ctaGradient }}
              >
                {data.linkText || 'Shop Now'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
