'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/incidents`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setIncidents(json.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/incidents/${id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Incident marked as ${status}`);
        fetchIncidents();
      }
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/incidents/${selectedIncident.id}/comments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: commentText })
      });
      if (res.ok) {
        toast.success('Comment added');
        setCommentText('');
        // Re-fetch just the incident
        const incidentRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/incidents/${selectedIncident.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const incidentJson = await incidentRes.json();
        setSelectedIncident(incidentJson.data);
      }
    } catch (e) {
      toast.error('Failed to add comment');
    }
  };

  const openDetails = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/incidents/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setSelectedIncident(json.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'title', header: 'Incident Title' },
    { 
      accessorKey: 'priority', 
      header: 'Priority',
      cell: ({ row }) => (
        <Badge variant={row.getValue('priority') === 'CRITICAL' ? 'destructive' : 'secondary'}>
          {row.getValue('priority')}
        </Badge>
      )
    },
    { 
      accessorKey: 'status', 
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant="outline">{row.getValue('status')}</Badge>
      )
    },
    { 
      accessorKey: 'createdAt', 
      header: 'Created',
      cell: ({ row }) => new Date(row.getValue('createdAt')).toLocaleString()
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => openDetails(row.original.id)}>View Details</Button>
          {row.original.status !== 'RESOLVED' && row.original.status !== 'CLOSED' && (
            <Button variant="default" size="sm" onClick={() => updateStatus(row.original.id, 'RESOLVED')}>Resolve</Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incident Management</h1>
        <p className="text-muted-foreground mt-1">Track and resolve escalated grid alerts and anomalies.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={incidents} />
        </CardContent>
      </Card>

      <Dialog open={!!selectedIncident} onOpenChange={(open) => !open && setSelectedIncident(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident: {selectedIncident?.title}</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Status</div>
                  <Badge>{selectedIncident.status}</Badge>
                </div>
                <div>
                  <div className="text-sm font-semibold text-muted-foreground">Priority</div>
                  <Badge variant={selectedIncident.priority === 'CRITICAL' ? 'destructive' : 'secondary'}>{selectedIncident.priority}</Badge>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-1">Description</div>
                <div className="text-sm bg-muted/30 p-3 rounded-md">{selectedIncident.description}</div>
              </div>

              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-2">Timeline & Comments</div>
                <div className="space-y-3">
                  {selectedIncident.comments?.map((c: any) => (
                    <div key={c.id} className="bg-muted/30 p-3 rounded-md text-sm">
                      <div className="font-semibold text-xs text-primary mb-1">
                        {c.user?.firstName} {c.user?.lastName} - {new Date(c.createdAt).toLocaleString()}
                      </div>
                      <div>{c.content}</div>
                    </div>
                  ))}
                  {selectedIncident.comments?.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">No comments yet.</div>
                  )}
                </div>
                
                <div className="mt-4 flex gap-2">
                  <Input placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} />
                  <Button onClick={addComment}>Post</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
