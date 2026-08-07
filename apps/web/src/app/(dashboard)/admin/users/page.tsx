'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MoreHorizontal, UserPlus, Shield, UserCog, User } from 'lucide-react';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const users = [
    { id: 'U-001', name: 'Alice Admin', email: 'alice@powerguard.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '10 mins ago' },
    { id: 'U-002', name: 'Bob Officer', email: 'bob@powerguard.com', role: 'UTILITY_OFFICER', status: 'ACTIVE', lastLogin: '1 hour ago' },
    { id: 'U-003', name: 'Charlie Consumer', email: 'charlie@gmail.com', role: 'CONSUMER', status: 'ACTIVE', lastLogin: 'Yesterday' },
    { id: 'U-004', name: 'Dave Inspector', email: 'dave@powerguard.com', role: 'UTILITY_OFFICER', status: 'ACTIVE', lastLogin: '2 days ago' },
    { id: 'U-005', name: 'Eve Suspended', email: 'eve@gmail.com', role: 'CONSUMER', status: 'SUSPENDED', lastLogin: '1 month ago' },
    { id: 'U-006', name: 'Frank Admin', email: 'frank@powerguard.com', role: 'ADMIN', status: 'ACTIVE', lastLogin: '5 mins ago' },
  ];

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'ADMIN': return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20 gap-1"><Shield className="h-3 w-3" /> Admin</Badge>;
      case 'UTILITY_OFFICER': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1"><UserCog className="h-3 w-3" /> Utility</Badge>;
      default: return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 gap-1"><User className="h-3 w-3" /> Consumer</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">User <span className="text-gradient">Management</span></h1>
          <p className="text-muted-foreground mt-1">Manage RBAC roles and platform access.</p>
        </div>
        <Button className="gap-2"><UserPlus className="h-4 w-4" /> Invite User</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>System Users</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search users..." 
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0"><Filter className="h-4 w-4" /></Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-y border-border/50">
                <tr>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Last Login</th>
                  <th className="px-6 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-semibold">{user.name}</td>
                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-4">
                       <span className={`flex items-center gap-2 text-xs font-medium ${user.status === 'ACTIVE' ? 'text-success' : 'text-muted-foreground'}`}>
                          <div className={`h-2 w-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-success' : 'bg-muted-foreground'}`} />
                          {user.status}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
