'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CloverConnection } from '@/lib/types';

interface CloverSectionProps {
  connection: CloverConnection;
  onConnect: (apiKey: string) => Promise<void>;
  onDisconnect: () => Promise<void>;
}

export function CloverSection({ connection, onConnect, onDisconnect }: CloverSectionProps) {
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    if (!apiKey.trim()) return;
    setIsConnecting(true);
    try {
      await onConnect(apiKey.trim());
      setApiKey('');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await onDisconnect();
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Clover Integration</h2>
        <Badge variant={connection.isConnected ? "default" : "secondary"}>
          {connection.isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {connection.isConnected ? (
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">
              Merchant ID: <span className="font-mono">{connection.merchantId}</span>
            </p>
            {connection.lastSyncAt && (
              <p className="text-sm text-gray-600">
                Last sync: {new Date(connection.lastSyncAt).toLocaleString()}
              </p>
            )}
          </div>
          <Button 
            onClick={handleDisconnect} 
            disabled={isDisconnecting}
            variant="destructive"
          >
            {isDisconnecting ? 'Disconnecting...' : 'Disconnect from Clover'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Clover account to sync products and inventory automatically.
          </p>
          <div className="space-y-2">
            <Label htmlFor="clover-api-key">Clover API Key</Label>
            <div className="flex gap-2">
              <Input
                id="clover-api-key"
                type="password"
                placeholder="Enter your Clover API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
              />
              <Button 
                onClick={handleConnect} 
                disabled={!apiKey.trim() || isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}