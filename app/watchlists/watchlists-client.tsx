'use client';

import { useState, useTransition } from 'react';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { track } from '@/lib/utils/track';

interface WatchlistItemRow {
  id: string;
  product_id: string;
  target_price: number | null;
  alert_status: 'waiting' | 'triggered' | 'disabled';
}
interface WatchlistRow {
  id: string;
  name: string;
  watchlist_items: WatchlistItemRow[];
}

export function WatchlistsClient({ initialWatchlists }: { initialWatchlists: WatchlistRow[] }) {
  const [watchlists, setWatchlists] = useState(initialWatchlists);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [pending, startTransition] = useTransition();

  function createWatchlist() {
    if (!newName.trim()) return;
    startTransition(async () => {
      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim() }),
      });
      if (res.ok) {
        const { watchlist } = await res.json();
        setWatchlists((prev) => [{ ...watchlist, watchlist_items: [] }, ...prev]);
        setNewName('');
        track('watchlist_created', { name: watchlist.name });
      }
    });
  }

  function renameWatchlist(id: string) {
    if (!editingName.trim()) return;
    startTransition(async () => {
      const res = await fetch(`/api/watchlists/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingName.trim() }),
      });
      if (res.ok) {
        setWatchlists((prev) => prev.map((w) => (w.id === id ? { ...w, name: editingName.trim() } : w)));
        setEditingId(null);
      }
    });
  }

  function deleteWatchlist(id: string) {
    startTransition(async () => {
      const res = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
      if (res.ok) setWatchlists((prev) => prev.filter((w) => w.id !== id));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex max-w-md gap-2">
        <Input placeholder="New watchlist name, e.g. Travel headphones" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button onClick={createWatchlist} disabled={pending}><Plus className="h-4 w-4" /> Create</Button>
      </div>

      {watchlists.length === 0 ? (
        <div className="rounded-md border border-dashed border-ink-300 py-16 text-center text-sm text-ink-500">
          No watchlists yet. Create one above, then add products from any product page.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {watchlists.map((w) => (
            <div key={w.id} className="rounded-md border border-ink-200 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                {editingId === w.id ? (
                  <div className="flex flex-1 items-center gap-1">
                    <Input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="h-8" />
                    <button onClick={() => renameWatchlist(w.id)} className="text-good-600"><Check className="h-4 w-4" /></button>
                    <button onClick={() => setEditingId(null)} className="text-ink-400"><X className="h-4 w-4" /></button>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium text-ink-900">{w.name}</h3>
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditingId(w.id); setEditingName(w.name); }} className="text-ink-400 hover:text-ink-900"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => deleteWatchlist(w.id)} className="text-ink-400 hover:text-bad-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-500">{w.watchlist_items.length} product{w.watchlist_items.length === 1 ? '' : 's'}</p>
              {w.watchlist_items.some((i) => i.alert_status === 'triggered') && (
                <p className="mt-1 text-xs font-medium text-good-600">Price alert triggered on {w.watchlist_items.filter((i) => i.alert_status === 'triggered').length} item(s)</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
