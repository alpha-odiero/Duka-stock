import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plug, Pencil, Link2, Unlink, CheckCircle2 } from 'lucide-react';
import { integrationService, type IntegrationInput } from '@/services/integrations';
import type { ApiIntegration } from '@/types';
import { extractError } from '@/lib/api';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Card } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const PROVIDERS: { value: string; label: string; hint: string }[] = [
  { value: 'MPESA', label: 'M-Pesa', hint: 'Payment gateway for mobile money payments.' },
  { value: 'CLOUDINARY', label: 'Cloudinary', hint: 'Cloud image hosting for products and storefront.' },
  { value: 'EMAIL', label: 'Email', hint: 'Transactional email service provider.' },
  { value: 'SMS', label: 'SMS', hint: 'SMS notifications and order alerts.' },
  { value: 'SHIPPING', label: 'Shipping', hint: 'Courier / logistics integration for deliveries.' },
  { value: 'WEBSITE', label: 'Website', hint: 'Connect an external website or booking platform.' },
  { value: 'ACCOUNTING', label: 'Accounting', hint: 'Sync sales to accounting software.' },
  { value: 'ANALYTICS', label: 'Analytics', hint: 'Storefront analytics and tracking.' },
  { value: 'WEBHOOKS', label: 'Webhooks', hint: 'Push events to an external endpoint.' },
  { value: 'OTHER', label: 'Other', hint: 'Any other service not listed.' },
];

export function IntegrationsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<ApiIntegration | 'new' | null>(null);

  const integrations = useQuery({
    queryKey: ['integrations'],
    queryFn: integrationService.list,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['integrations'] });
  const list = integrations.data ?? [];

  const onSaved = (message: string) => {
    toast(message);
    invalidate();
    setEditing(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title="API & Integrations"
        subtitle="Connect external services. Secrets are encrypted at rest and never shown."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plug className="h-4 w-4" /> Connect service
          </Button>
        }
      />

      {integrations.isLoading ? (
        <Skeleton className="h-40" />
      ) : integrations.isError ? (
        <Card className="p-6 text-sm text-danger">Could not load integrations.</Card>
      ) : list.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Plug className="h-8 w-8" />}
            title="No integrations yet"
            description="Connect services like payment gateways, image hosting, email or SMS to extend your store."
          />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {list.map((integ) => (
            <Card key={integ.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                    <Plug className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink">{integ.label}</p>
                    <p className="text-xs uppercase tracking-wide text-muted">{integ.provider}</p>
                  </div>
                </div>
                <Badge tone={integ.status === 'CONNECTED' ? 'green' : integ.status === 'ERROR' ? 'red' : 'gray'}>
                  {integ.status === 'CONNECTED' ? 'Connected' : integ.status === 'ERROR' ? 'Error' : 'Disconnected'}
                </Badge>
              </div>

              {integ.description && <p className="mt-3 text-sm text-muted">{integ.description}</p>}

              <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                {integ.maskedValue ? (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-line/60 px-2 py-1 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    {integ.maskedValue}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-line/60 px-2 py-1 font-mono">
                    <Unlink className="h-3.5 w-3.5" /> No credential
                  </span>
                )}
                {integ.connectedAt && <span>Connected {new Date(integ.connectedAt).toLocaleDateString()}</span>}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <Button variant="outline" size="sm" onClick={() => setEditing(integ)}>
                  <Pencil className="h-4 w-4" /> Configure
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      await integrationService.disconnect(integ.id);
                      toast('Integration disconnected');
                      invalidate();
                    } catch (err) {
                      toast(extractError(err).message, { type: 'error' });
                    }
                  }}
                >
                  <Unlink className="h-4 w-4" /> Disconnect
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <IntegrationForm integration={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={onSaved} />
      )}
    </div>
  );
}

function IntegrationForm({
  integration,
  onClose,
  onSaved,
}: {
  integration: ApiIntegration | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [provider, setProvider] = useState(integration?.provider ?? 'MPESA');
  const [label, setLabel] = useState(integration?.label ?? '');
  const [description, setDescription] = useState(integration?.description ?? '');
  const [credential, setCredential] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!label.trim()) {
      setError('Service label is required.');
      return;
    }
    const payload: IntegrationInput = {
      provider,
      label: label.trim(),
      description: description.trim() || null,
      credential: credential.trim() || null,
    };
    setBusy(true);
    try {
      if (integration) {
        await integrationService.update(integration.id, payload);
        onSaved('Integration updated');
      } else {
        await integrationService.connect(payload);
        onSaved('Integration connected');
      }
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={integration ? 'Configure integration' : 'Connect a service'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} loading={busy}>
            <Link2 className="h-4 w-4" /> {integration ? 'Save' : 'Connect'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Select
          label="Service"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          options={PROVIDERS.map((p) => ({ value: p.value, label: p.label }))}
        />
        <Input label="Label" placeholder="e.g. M-Pesa Daraja" value={label} onChange={(e) => setLabel(e.target.value)} error={error} autoFocus />
        <Textarea label="Description (optional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        <Input
          label={integration ? 'New credential (leave blank to keep current)' : 'API key / secret'}
          type="password"
          placeholder="••••••••••••"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
        />
        <p className="text-xs text-muted">
          Credentials are encrypted at rest and never returned to the browser. Only a masked preview is stored.
        </p>
      </div>
    </Modal>
  );
}
