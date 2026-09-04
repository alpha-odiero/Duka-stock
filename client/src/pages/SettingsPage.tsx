import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import { shopService } from '@/services/shop';
import { authService } from '@/services/auth';
import { extractError } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { PageHeader } from '@/components/ui/page-header';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const CURRENCIES = [
  { value: 'KES', label: 'KES (Kenya Shilling)' },
  { value: 'UGX', label: 'UGX (Uganda Shilling)' },
  { value: 'TZS', label: 'TZS (Tanzanian Shilling)' },
  { value: 'NGN', label: 'NGN (Nigerian Naira)' },
  { value: 'GHS', label: 'GHS (Ghanaian Cedi)' },
  { value: 'USD', label: 'USD (US Dollar)' },
];

const TIMEZONES = [
  { value: 'Africa/Nairobi', label: 'Africa/Nairobi (EAT, East Africa Time)' },
  { value: 'Africa/Kampala', label: 'Africa/Kampala' },
  { value: 'Africa/Dar_es_Salaam', label: 'Africa/Dar es Salaam' },
  { value: 'Africa/Accra', label: 'Africa/Accra (GMT)' },
  { value: 'Africa/Lagos', label: 'Africa/Lagos (WAT)' },
  { value: 'Africa/Cairo', label: 'Africa/Cairo (EET)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
];

export function SettingsPage() {
  const { user, shop, logout, setUser, setShop } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shopError, setShopError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showSignout, setShowSignout] = useState(false);

  // Shop form
  const [name, setName] = useState(shop?.name ?? '');
  const [phone, setPhone] = useState(shop?.phone ?? '');
  const [email, setEmail] = useState(shop?.email ?? '');
  const [location, setLocation] = useState(shop?.location ?? '');
  const [currency, setCurrency] = useState(shop?.currency ?? 'KES');
  const [desc, setDesc] = useState(shop?.description ?? '');

  // Business profile (appears on receipts)
  const [address, setAddress] = useState(shop?.address ?? '');
  const [city, setCity] = useState(shop?.city ?? '');
  const [country, setCountry] = useState(shop?.country ?? '');
  const [businessPin, setBusinessPin] = useState(shop?.businessPin ?? '');
  const [website, setWebsite] = useState(shop?.website ?? '');

  // Receipt configuration
  const [timezone, setTimezone] = useState(shop?.timezone ?? 'Africa/Nairobi');
  const [registerName, setRegisterName] = useState(shop?.registerName ?? 'POS-01');
  const [receiptFooter, setReceiptFooter] = useState(shop?.receiptFooter ?? '');

  // Profile form
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [pPhone, setPPhone] = useState(user?.phone ?? '');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const saveShop = useMutation({
    mutationFn: () =>
      shopService.update({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        location: location.trim() || undefined,
        currency,
        description: desc.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        businessPin: businessPin.trim() || undefined,
        website: website.trim() || undefined,
        timezone,
        registerName: registerName.trim() || 'POS-01',
        receiptFooter: receiptFooter.trim() || undefined,
      }),
    onSuccess: (s) => {
      setShop(s);
      toast('Shop details saved');
    },
    onError: (e) => setShopError(extractError(e).message),
  });

  const saveProfile = useMutation({
    mutationFn: () => authService.updateProfile({ fullName: fullName.trim(), phone: pPhone?.trim() || undefined }),
    onSuccess: (u) => {
      setUser(u);
      toast('Profile saved');
    },
    onError: (e) => setProfileError(extractError(e).message),
  });

  const savePassword = useMutation({
    mutationFn: () => authService.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (e) => setPasswordError(extractError(e).message),
  });

  const submitPassword = () => {
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setPasswordError(null);
    savePassword.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Manage your shop and account" />

      {/* Shop details */}
      <Card>
        <CardHeader title="Shop details" subtitle="This appears on your receipts" />
        <div className="space-y-4 p-5">
          {shopError && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {shopError}
            </div>
          )}
          <Input label="Shop name" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
          <Select label="Currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)} options={CURRENCIES} />
          <Textarea label="Description (optional)" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <div className="flex justify-end">
            <Button onClick={() => saveShop.mutate()} loading={saveShop.isPending}>Save shop</Button>
          </div>
        </div>
      </Card>

      {/* Business profile — printed on receipts */}
      <Card>
        <CardHeader title="Business profile" subtitle="This is the registered business shown on your receipts" />
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Street address" value={address} onChange={(e) => setAddress(e.target.value)} />
            <Input label="City / Town" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
            <Input label="Business / KRA PIN" value={businessPin} onChange={(e) => setBusinessPin(e.target.value)} />
          </div>
          <Input label="Website (optional)" value={website} onChange={(e) => setWebsite(e.target.value)} />
          <div className="flex justify-end">
            <Button onClick={() => saveShop.mutate()} loading={saveShop.isPending}>Save business profile</Button>
          </div>
        </div>
      </Card>

      {/* Receipt settings */}
      <Card>
        <CardHeader title="Receipt settings" subtitle="Controls for printing and the cash register" />
        <div className="space-y-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Timezone"
              name="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={TIMEZONES}
            />
            <Input label="Cash register name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} />
          </div>
          <Textarea
            label="Receipt footer (optional)"
            value={receiptFooter}
            onChange={(e) => setReceiptFooter(e.target.value)}
            placeholder="e.g. Goods once sold are not returnable unless exchanges."
          />
          <div className="flex justify-end">
            <Button onClick={() => saveShop.mutate()} loading={saveShop.isPending}>Save receipt settings</Button>
          </div>
        </div>
      </Card>

      {/* Profile */}
      <Card>
        <CardHeader title="Your profile" subtitle="Account information" />
        <div className="space-y-4 p-5">
          {profileError && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {profileError}
            </div>
          )}
          <Input label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Phone" type="tel" value={pPhone} onChange={(e) => setPPhone(e.target.value)} />
            <Input label="Email" value={user?.email ?? ''} disabled />
          </div>
          <div className="flex justify-end">
            <Button onClick={() => saveProfile.mutate()} loading={saveProfile.isPending}>Save profile</Button>
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader title="Change password" subtitle="Use at least 8 characters" />
        <div className="space-y-4 p-5">
          {passwordError && (
            <div role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              {passwordError}
            </div>
          )}
          <Input label="Current password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="New password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            <Input label="Confirm new password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
          <div className="flex justify-end">
            <Button onClick={submitPassword} loading={savePassword.isPending}>Update password</Button>
          </div>
        </div>
      </Card>

      {/* Sign out */}
      <div className="flex justify-center">
        <Button variant="ghost" onClick={() => setShowSignout(true)} className="text-danger">
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>

      <ConfirmDialog
        open={showSignout}
        onClose={() => setShowSignout(false)}
        onConfirm={async () => {
          setShowSignout(false);
          await logout();
          queryClient.clear();
        }}
        title="Sign out?"
        message="You'll need to sign in again to manage this shop."
        confirmLabel="Sign out"
      />
    </div>
  );
}
