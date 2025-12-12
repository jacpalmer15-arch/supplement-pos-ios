import { NextRequest, NextResponse } from 'next/server';
import type { MerchantProfile } from '@/lib/types';

// Mock storage - in production, this would be stored in a database
let mockMerchantProfile: MerchantProfile = {
  businessName: 'Zenith Supplements',
  contactName: 'John Doe',
  email: 'john@zenithsupplements.com',
  phone: '(555) 123-4567',
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
  },
  timezone: 'America/Los_Angeles',
  currency: 'USD',
};

export async function GET() {
  return NextResponse.json(mockMerchantProfile);
}

export async function PUT(request: NextRequest) {
  try {
    const profile = await request.json();
    
    // Basic validation
    const requiredFields = ['businessName', 'contactName', 'email', 'phone'];
    for (const field of requiredFields) {
      if (!profile[field] || typeof profile[field] !== 'string') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Validate address
    if (!profile.address || typeof profile.address !== 'object') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const addressFields = ['street', 'city', 'state', 'zip'];
    for (const field of addressFields) {
      if (!profile.address[field] || typeof profile.address[field] !== 'string') {
        return NextResponse.json(
          { error: `Address ${field} is required` },
          { status: 400 }
        );
      }
    }

    mockMerchantProfile = profile;
    return NextResponse.json(mockMerchantProfile);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update merchant profile' },
      { status: 500 }
    );
  }
}