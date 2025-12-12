'use client';

import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Trash2 } from 'lucide-react';

type DeletedOrder = {
  external_id: string;
  clover_order_id: string;
};

export default function SyncPage() {
  const qc = useQueryClient();
  const [productStatus, setProductStatus] = useState<string>('');
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [runningProducts, setRunningProducts] = useState(false);
  const [runningOrders, setRunningOrders] = useState(false);
  const [deletedOrders, setDeletedOrders] = useState<DeletedOrder[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingDeletedOrders, setLoadingDeletedOrders] = useState(false);
  const productAbortRef = useRef<AbortController | null>(null);
  const orderAbortRef = useRef<AbortController | null>(null);

  async function runProductSync() {
    setProductStatus('Starting product sync…'); 
    setRunningProducts(true);
    try {
      productAbortRef.current = new AbortController();
      // --- Get the current session and attach the JWT as Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/products/sync', {
        method: 'POST',
        signal: productAbortRef.current.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const text = await res.text();
      if (!res.ok) setProductStatus(`Error ${res.status}: ${text}`);
      else {
        setProductStatus(text || 'Product sync complete.');
        // 🔄 refresh lists after a successful sync
        qc.invalidateQueries({ queryKey: ['products'] });
        qc.invalidateQueries({ queryKey: ['inventory'] });
        qc.invalidateQueries({ queryKey: ['inventory-low'] });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setProductStatus(err?.name === 'AbortError' ? 'Canceled.' : String(err?.message || err));
    } finally { 
      setRunningProducts(false); 
      productAbortRef.current = null; 
    }
  }

  async function runOrderSync() {
    setOrderStatus('Starting order sync…'); 
    setRunningOrders(true);
    setDeletedOrders([]); // Clear previous deleted orders
    try {
      orderAbortRef.current = new AbortController();
      // --- Get the current session and attach the JWT as Authorization header
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const res = await fetch('/api/products/sync-orders', {
        method: 'POST',
        signal: orderAbortRef.current.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const text = await res.text();
      
      if (!res.ok) {
        setOrderStatus(`Error ${res.status}: ${text}`);
      } else {
        setOrderStatus(text || 'Order sync complete.');
        
        // Parse response to check for deleted orders
        try {
          const response = JSON.parse(text);
          if (response.marked_for_delete && response.marked_for_delete > 0) {
            // Fetch orders with status = 'DELETED' from Supabase
            const { data: deletedOrdersData } = await supabase
              .from('transactions')
              .select('external_id, clover_order_id')
              .eq('status', 'DELETED');
            
            if (deletedOrdersData && deletedOrdersData.length > 0) {
              setDeletedOrders(deletedOrdersData);
              setShowDeleteModal(true);
            }
          }
        } catch (parseError) {
          // If response is not JSON, just show the text
          console.log('Response is not JSON:', text);
        }
        
        // 🔄 refresh orders after a successful sync
        qc.invalidateQueries({ queryKey: ['transactions'] });
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
    } catch (e: unknown) {
      const err = e as Error;
      setOrderStatus(err?.name === 'AbortError' ? 'Canceled.' : String(err?.message || err));
    } finally { 
      setRunningOrders(false); 
      orderAbortRef.current = null; 
    }
  }

  async function checkForDeletedOrders() {
    setLoadingDeletedOrders(true);
    try {
      // Query for orders with status = 'DELETED'
      const { data: deletedOrdersData, error } = await supabase
        .from('transactions')
        .select('external_id, clover_order_id')
        .eq('status', 'DELETED');
      
      if (error) {
        setOrderStatus(`Error fetching deleted orders: ${error.message}`);
        return;
      }
      
      if (deletedOrdersData && deletedOrdersData.length > 0) {
        setDeletedOrders(deletedOrdersData);
        setShowDeleteModal(true);
        setOrderStatus(`Found ${deletedOrdersData.length} orders marked for deletion.`);
      } else {
        setOrderStatus('No orders marked for deletion found.');
      }
    } catch (error) {
      setOrderStatus(`Error checking for deleted orders: ${error}`);
    } finally {
      setLoadingDeletedOrders(false);
    }
  }

  async function handleDeleteOrders() {
    setDeleting(true);
    try {
      const orderIds = deletedOrders.map(o => o.external_id);
      
      // First, get the transaction IDs
      const { data: transactions, error: fetchError } = await supabase
        .from('transactions')
        .select('id')
        .in('external_id', orderIds);
      
      if (fetchError) {
        setOrderStatus(`Error fetching transactions: ${fetchError.message}`);
        return;
      }
      
      const transactionIds = transactions?.map(t => t.id) || [];
      
      // Step 1: Delete transaction_items (line items) first
      const { error: itemsError } = await supabase
        .from('transaction_items')
        .delete()
        .in('transaction_id', transactionIds);
      
      if (itemsError) {
        setOrderStatus(`Error deleting line items: ${itemsError.message}`);
        return;
      }
      
      // Step 2: Delete transactions (header records)
      const { error: transactionsError } = await supabase
        .from('transactions')
        .delete()
        .in('external_id', orderIds);
      
      if (transactionsError) {
        setOrderStatus(`Error deleting transactions: ${transactionsError.message}`);
      } else {
        setOrderStatus(`Successfully deleted ${orderIds.length} orders and their line items.`);
        setShowDeleteModal(false);
        setDeletedOrders([]);
        
        // Refresh data
        qc.invalidateQueries({ queryKey: ['transactions'] });
        qc.invalidateQueries({ queryKey: ['orders'] });
        qc.invalidateQueries({ queryKey: ['dashboard-stats'] });
      }
    } catch (error) {
      setOrderStatus(`Error deleting orders: ${error}`);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Sync</h1>
      
      {/* Product Sync Section */}
      <div className="mb-8 bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium mb-4">Product Sync</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sync products and inventory from Clover to Supabase
        </p>
        <button 
          onClick={runProductSync} 
          disabled={runningProducts}
          className="rounded-md bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {runningProducts ? 'Running…' : 'Run Product Sync'}
        </button>
        {productStatus && (
          <pre className="mt-4 whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm">
            {productStatus}
          </pre>
        )}
      </div>

      {/* Order Sync Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-medium mb-4">Order Sync</h2>
        <p className="text-sm text-gray-600 mb-4">
          Sync orders from Clover to Supabase
        </p>
        <div className="flex gap-3">
          <button 
            onClick={runOrderSync} 
            disabled={runningOrders}
            className="rounded-md bg-green-600 text-white px-4 py-2 text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {runningOrders ? 'Running…' : 'Run Order Sync'}
          </button>
          <button 
            onClick={checkForDeletedOrders} 
            disabled={loadingDeletedOrders}
            className="rounded-md bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingDeletedOrders ? 'Checking…' : 'Clean Up Orders'}
          </button>
        </div>
        {orderStatus && (
          <pre className="mt-4 whitespace-pre-wrap rounded border bg-gray-50 p-3 text-sm">
            {orderStatus}
          </pre>
        )}
      </div>

      {/* Delete Orders Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Orders Marked for Deletion
            </DialogTitle>
            <DialogDescription>
              The following {deletedOrders.length} orders are marked as deleted in Clover. 
              Would you like to remove them from your database?
            </DialogDescription>
          </DialogHeader>

          <div className="my-4">
            <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
              {deletedOrders.map((order) => (
                <div key={order.external_id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">Order: {order.external_id}</div>
                    <div className="text-xs text-gray-500">Clover ID: {order.clover_order_id}</div>
                  </div>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deleting}
            >
              Keep Orders
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrders}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : `Delete ${deletedOrders.length} Orders`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}