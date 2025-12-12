'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { FeatureFlags } from '@/lib/types';

interface FeatureFlagsSectionProps {
  flags: FeatureFlags;
  onUpdate: (flags: FeatureFlags) => Promise<void>;
}

export function FeatureFlagsSection({ flags, onUpdate }: FeatureFlagsSectionProps) {
  const [localFlags, setLocalFlags] = useState(flags);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof FeatureFlags) => {
    const newFlags = { ...localFlags, [key]: !localFlags[key] };
    setLocalFlags(newFlags);
    setHasChanges(JSON.stringify(newFlags) !== JSON.stringify(flags));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdate(localFlags);
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setLocalFlags(flags);
    setHasChanges(false);
  };

  const flagConfig = [
    {
      key: 'enableKioskMode' as const,
      label: 'Kiosk Mode',
      description: 'Enable self-checkout kiosk interface'
    },
    {
      key: 'enableInventoryTracking' as const,
      label: 'Inventory Tracking',
      description: 'Track inventory levels automatically'
    },
    {
      key: 'enableLowStockAlerts' as const,
      label: 'Low Stock Alerts',
      description: 'Send notifications when inventory is low'
    },
    {
      key: 'enableProductRecommendations' as const,
      label: 'Product Recommendations',
      description: 'Show related product suggestions'
    },
    {
      key: 'enableReports' as const,
      label: 'Reports',
      description: 'Generate sales and inventory reports'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Feature Flags</h2>
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

      <div className="space-y-4">
        {flagConfig.map((flag) => (
          <div key={flag.key} className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor={flag.key}>{flag.label}</Label>
              <p className="text-sm text-gray-600">{flag.description}</p>
            </div>
            <Switch
              id={flag.key}
              checked={localFlags[flag.key]}
              onCheckedChange={() => handleToggle(flag.key)}
            />
          </div>
        ))}
      </div>
    </Card>
  );
}