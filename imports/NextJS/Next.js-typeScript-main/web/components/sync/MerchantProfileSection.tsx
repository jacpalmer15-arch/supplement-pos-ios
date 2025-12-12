'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MerchantProfile } from '@/lib/types';

interface MerchantProfileSectionProps {
  profile: MerchantProfile;
  onUpdate: (profile: MerchantProfile) => Promise<void>;
}

export function MerchantProfileSection({ profile, onUpdate }: MerchantProfileSectionProps) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (path: string, value: string) => {
    const pathArray = path.split('.');
    const newProfile = { ...localProfile };
    let current = newProfile as Record<string, unknown>;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current = current[pathArray[i]] as Record<string, unknown>;
    }
    current[pathArray[pathArray.length - 1]] = value;
    
    setLocalProfile(newProfile);
    setHasChanges(JSON.stringify(newProfile) !== JSON.stringify(profile));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localProfile);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalProfile(profile);
    setHasChanges(false);
  };

  const timezones = [
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'America/Phoenix',
    'UTC'
  ];

  const currencies = ['USD', 'CAD', 'EUR', 'GBP'];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Merchant Profile</h2>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={localProfile.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name</Label>
          <Input
            id="contactName"
            value={localProfile.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={localProfile.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={localProfile.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="street">Street Address</Label>
          <Input
            id="street"
            value={localProfile.address.street}
            onChange={(e) => handleChange('address.street', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={localProfile.address.city}
            onChange={(e) => handleChange('address.city', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={localProfile.address.state}
            onChange={(e) => handleChange('address.state', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">ZIP Code</Label>
          <Input
            id="zip"
            value={localProfile.address.zip}
            onChange={(e) => handleChange('address.zip', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={localProfile.timezone} onValueChange={(value) => handleChange('timezone', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select value={localProfile.currency} onValueChange={(value) => handleChange('currency', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr} value={curr}>
                  {curr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}