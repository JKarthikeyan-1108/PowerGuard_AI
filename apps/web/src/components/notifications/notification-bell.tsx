'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSocket } from '@/providers/SocketProvider';
import { toast } from 'sonner';

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    // Initial fetch (mocked fetch call here, normally use React Query)
    fetchNotifications();

    if (socket) {
      socket.on('new_notification', (data: any) => {
        setNotifications((prev) => [data, ...prev]);
        setUnreadCount((prev) => prev + 1);
        toast.info(data.title, { description: data.body });
      });

      socket.on('new_alert', (data: any) => {
        toast.error(`New Alert: ${data.title}`, { description: data.description });
      });
    }

    return () => {
      if (socket) {
        socket.off('new_notification');
        socket.off('new_alert');
      }
    };
  }, [socket]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications?limit=10`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data.data);
        setUnreadCount(json.data.unreadCount);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/notifications/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 pb-2">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-auto p-0 text-blue-500">
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div key={n.id} className={`p-4 border-b text-sm transition-colors hover:bg-muted/50 ${!n.read ? 'bg-muted/20' : ''}`}>
                  <div className="font-semibold mb-1">{n.title}</div>
                  <div className="text-muted-foreground line-clamp-2">{n.body}</div>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
