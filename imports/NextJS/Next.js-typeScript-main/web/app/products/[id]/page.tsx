'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  useEffect(() => {
    // Redirect to products page since editing is now done inline in the drawer
    router.replace('/products');
  }, [router]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to products page...</p>
        <p className="text-sm text-gray-500 mt-2">
          Product editing is now available directly from the products list.
        </p>
      </div>
    </main>
  );
}
