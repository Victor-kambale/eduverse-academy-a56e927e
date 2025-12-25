import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Users, 
  FileText,
  X,
  Scale,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';

interface UniversityApplication {
  id: string;
  institution_name: string;
  institution_type: string;
  country: string;
  city: string | null;
  primary_email: string;
  primary_phone: string | null;
  contact_name: string;
  student_count: string | null;
  faculty_count: string | null;
  founding_year: number | null;
  programs_offered: string[] | null;
  accreditation_bodies: string[] | null;
  email_verified: boolean;
  phone_verified: boolean;
  contract_signed: boolean;
  status: string;
  created_at: string;
}

interface ApplicationComparisonProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ApplicationComparison: React.FC<ApplicationComparisonProps> = ({
  open,
  onOpenChange,
}) => {
  const [applications, setApplications] = useState<UniversityApplication[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchApplications();
    }
  }, [open]);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('university_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setApplications(data as UniversityApplication[]);
    }
    setLoading(false);
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else if (newSelection.size < 4) {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const selectedApps = applications.filter(app => selectedIds.has(app.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'under_review':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />Under Review</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const comparisonFields = [
    { key: 'institution_type', label: 'Institution Type', format: (v: any) => v || '-' },
    { key: 'country', label: 'Country', format: (v: any) => v || '-' },
    { key: 'city', label: 'City', format: (v: any) => v || '-' },
    { key: 'founding_year', label: 'Founded', format: (v: any) => v || '-' },
    { key: 'student_count', label: 'Students', format: (v: any) => v || '-' },
    { key: 'faculty_count', label: 'Faculty', format: (v: any) => v || '-' },
    { key: 'email_verified', label: 'Email Verified', format: (v: any) => v ? '✓' : '✗' },
    { key: 'phone_verified', label: 'Phone Verified', format: (v: any) => v ? '✓' : '✗' },
    { key: 'contract_signed', label: 'Contract Signed', format: (v: any) => v ? '✓' : '✗' },
    { key: 'created_at', label: 'Applied On', format: (v: any) => format(new Date(v), 'MMM d, yyyy') },
    { key: 'programs_offered', label: 'Programs', format: (v: any) => v?.length || 0 },
    { key: 'accreditation_bodies', label: 'Accreditations', format: (v: any) => v?.length || 0 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Compare Applications (Select up to 4)
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-0">
          {/* Selection List */}
          <div className="lg:w-64 shrink-0 border rounded-lg">
            <div className="p-3 border-b bg-muted/50">
              <p className="text-sm font-medium">Select Applications</p>
              <p className="text-xs text-muted-foreground">{selectedIds.size}/4 selected</p>
            </div>
            <ScrollArea className="h-48 lg:h-[50vh]">
              <div className="p-2 space-y-1">
                {loading ? (
                  <p className="text-sm text-muted-foreground p-2">Loading...</p>
                ) : (
                  applications.map(app => (
                    <div
                      key={app.id}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted ${
                        selectedIds.has(app.id) ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => toggleSelection(app.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(app.id)}
                        disabled={!selectedIds.has(app.id) && selectedIds.size >= 4}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{app.institution_name}</p>
                        <p className="text-xs text-muted-foreground">{app.country}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Comparison Table */}
          <div className="flex-1 min-w-0 overflow-auto">
            {selectedApps.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select applications to compare</p>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-3 text-left font-medium border-r w-40">Field</th>
                      {selectedApps.map(app => (
                        <th key={app.id} className="p-3 text-left font-medium border-r last:border-r-0 min-w-48">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate">{app.institution_name}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => toggleSelection(app.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-3 font-medium border-r bg-muted/30">Status</td>
                      {selectedApps.map(app => (
                        <td key={app.id} className="p-3 border-r last:border-r-0">
                          {getStatusBadge(app.status)}
                        </td>
                      ))}
                    </tr>
                    {comparisonFields.map(field => (
                      <tr key={field.key} className="border-t">
                        <td className="p-3 font-medium border-r bg-muted/30">{field.label}</td>
                        {selectedApps.map(app => (
                          <td key={app.id} className="p-3 border-r last:border-r-0">
                            {field.format((app as any)[field.key])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setSelectedIds(new Set())}>
            Clear Selection
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
