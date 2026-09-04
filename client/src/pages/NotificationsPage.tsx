import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, Package } from 'lucide-react';
import { notificationService } from '@/services/notifications';
import { timeAgo } from '@/lib/format';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function NotificationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notifications'] });

  const markAll = async () => {
    await notificationService.markAllRead();
    invalidate();
    toast('All notifications marked as read');
  };

  const markOne = async (id: string) => {
    await notificationService.markRead(id);
    invalidate();
  };

  const removeOne = async (id: string) => {
    await notificationService.remove(id);
    invalidate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Notifications"
        subtitle={
          data && data.unread > 0
            ? `${data.unread} unread`
            : "You're all caught up"
        }
        actions={
          data?.unread ? (
            <Button variant="secondary" size="sm" onClick={markAll}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {isLoading && (
        <Card className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </Card>
      )}

      {isError && (
        <Card className="p-6 text-center text-sm text-danger">
          Couldn't load notifications.{' '}
          <button onClick={() => refetch()} className="font-medium text-brand hover:underline">
            Try again
          </button>
        </Card>
      )}

      {data && data.notifications.length === 0 && (
        <Card>
          <EmptyState
            icon={<Bell className="h-6 w-6" />}
            iconTone="amber"
            title="No notifications"
            description="We'll let you know when stock runs low or something needs your attention."
          />
        </Card>
      )}

      {data && data.notifications.length > 0 && (
        <Card>
          <ul className="divide-y divide-line">
            {data.notifications.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 px-4 py-3 ${n.read ? '' : 'bg-primary-light/40'}`}>
                <span className="mt-0.5">{nIcon(n.type)}</span>
                <button onClick={() => !n.read && markOne(n.id)} className="min-w-0 flex-1 text-left">
                  <p className={`text-sm ${n.read ? 'font-medium text-ink' : 'font-semibold text-ink'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted">{timeAgo(n.createdAt)}</p>
                </button>
                {!n.read && <Badge tone="blue">New</Badge>}
                <button
                  onClick={() => removeOne(n.id)}
                  className="text-muted hover:text-danger"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function nIcon(type: string) {
  if (type === 'LOW_STOCK' || type === 'OUT_OF_STOCK')
    return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  if (type === 'SALE') return <Package className="h-5 w-5 text-teal-600" />;
  return <Info className="h-5 w-5 text-blue-600" />;
}
