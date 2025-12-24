import { useState } from 'react';
import { 
  Eye, 
  Palette, 
  Type, 
  Image as ImageIcon,
  Gift,
  Mail,
  Sparkles
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
  christmas: {
    name: 'Christmas Joy',
    headerGradient: 'linear-gradient(135deg, #dc2626 0%, #16a34a 100%)',
    ctaGradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
  },
  newyear: {
    name: 'New Year Sparkle',
    headerGradient: 'linear-gradient(135deg, #fbbf24 0%, #9333ea 50%, #1d4ed8 100%)',
    ctaGradient: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
  },
  minimal: {
    name: 'Clean Minimal',
    headerGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    ctaGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  summer: {
    name: 'Summer Vibes',
    headerGradient: 'linear-gradient(135deg, #f97316 0%, #fbbf24 50%, #84cc16 100%)',
    ctaGradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
};

export function EmailTemplatePreview({ data, onTemplateChange }: EmailTemplatePreviewProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof emailTemplates>(
    (data.template as keyof typeof emailTemplates) || 'default'
  );
  const [showPreview, setShowPreview] = useState(false);

  const template = emailTemplates[selectedTemplate];

  const handleTemplateChange = (value: string) => {
    setSelectedTemplate(value as keyof typeof emailTemplates);
    onTemplateChange?.(value);
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
      <td style="padding: 24px; background: #f8fafc;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33%" style="text-align: center; padding: 16px;">
              <p style="margin: 0; font-size: 32px;">📚</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600;">6,000+ Courses</p>
            </td>
            <td width="33%" style="text-align: center; padding: 16px;">
              <p style="margin: 0; font-size: 32px;">🎓</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600;">Certified Learning</p>
            </td>
            <td width="33%" style="text-align: center; padding: 16px;">
              <p style="margin: 0; font-size: 32px;">🌍</p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b; font-weight: 600;">193 Countries</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px; background: #0f172a; text-align: center;">
        <p style="margin: 0 0 8px 0; color: #ffffff; font-size: 16px; font-weight: 600;">
          Eduverse Academy
        </p>
        <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 12px;">
          Empowering learners worldwide
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
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Label>Email Template Style</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
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
            <Button variant="outline" className="mt-6">
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
    </div>
  );
}
