import { NextRequest, NextResponse } from 'next/server';
import type { FeatureFlags } from '@/lib/types';

// Mock storage - in production, this would be stored in a database
let mockFeatureFlags: FeatureFlags = {
  enableKioskMode: true,
  enableInventoryTracking: true,
  enableLowStockAlerts: false,
  enableProductRecommendations: false,
  enableReports: true,
};

export async function GET() {
  return NextResponse.json(mockFeatureFlags);
}

export async function PUT(request: NextRequest) {
  try {
    const flags = await request.json();
    
    // Validate the flags structure
    const requiredKeys: (keyof FeatureFlags)[] = [
      'enableKioskMode',
      'enableInventoryTracking', 
      'enableLowStockAlerts',
      'enableProductRecommendations',
      'enableReports'
    ];

    for (const key of requiredKeys) {
      if (typeof flags[key] !== 'boolean') {
        return NextResponse.json(
          { error: `Invalid value for ${key}` },
          { status: 400 }
        );
      }
    }

    mockFeatureFlags = flags;
    return NextResponse.json(mockFeatureFlags);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update feature flags' },
      { status: 500 }
    );
  }
}