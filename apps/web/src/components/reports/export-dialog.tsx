'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, FileSpreadsheet, FileIcon, Mail, Calendar, Printer, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportDialogProps {
  reportType: 'alerts' | 'billing' | 'theft' | 'energy' | 'revenue' | 'loss' | 'co2';
}

export function ExportDialog({ reportType }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setLoading(format);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/download?type=${reportType}&format=${format}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      toast.success(`${format.toUpperCase()} report downloaded successfully`);
      setOpen(false);
    } catch (error) {
      toast.error(`Failed to export ${format.toUpperCase()}`);
    } finally {
      setLoading(null);
    }
  };

  const handleAction = async (action: 'schedule' | 'email' | 'print') => {
    setLoading(action);
    try {
      if (action === 'print') {
        window.print();
        toast.success('Print dialog opened');
      } else if (action === 'schedule') {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/reports/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify({ frequency: 'MONTHLY' })
        });
        toast.success('Successfully subscribed to monthly scheduled reports');
      } else if (action === 'email') {
        // Mock email
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Report emailed to your registered address');
      }
      if (action !== 'print') setOpen(false);
    } catch (error) {
      toast.error(`Failed to execute ${action}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" /> Export Options
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export & Schedule Report</DialogTitle>
          <DialogDescription>
            Choose how you want to export or schedule this report.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExport('pdf')} disabled={!!loading}>
            {loading === 'pdf' ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6 text-red-500" />}
            Download PDF
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExport('excel')} disabled={!!loading}>
            {loading === 'excel' ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileSpreadsheet className="h-6 w-6 text-green-500" />}
            Download Excel
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleExport('csv')} disabled={!!loading}>
            {loading === 'csv' ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileIcon className="h-6 w-6 text-blue-500" />}
            Download CSV
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleAction('print')} disabled={!!loading}>
            {loading === 'print' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Printer className="h-6 w-6 text-slate-500" />}
            Print Dashboard
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleAction('email')} disabled={!!loading}>
            {loading === 'email' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Mail className="h-6 w-6 text-primary" />}
            Email Me
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleAction('schedule')} disabled={!!loading}>
            {loading === 'schedule' ? <Loader2 className="h-6 w-6 animate-spin" /> : <Calendar className="h-6 w-6 text-purple-500" />}
            Schedule Monthly
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
