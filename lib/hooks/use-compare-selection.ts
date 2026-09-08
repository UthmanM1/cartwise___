'use client';

import { useCallback, useEffect, useState } from 'react';
import { MAX_COMPARE_PRODUCTS } from '@/lib/constants';

const STORAGE_KEY = 'cw_compare_ids';
const EVENT_NAME = 'cw:compare-changed';

function readIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

/**
 * Tracks which product ids are queued for comparison. Backed by
 * localStorage so the selection survives navigation between /search and
 * /compare without requiring authentication (comparison is a browsable
 * feature — only saving/watchlisting requires an account).
 */
export function useCompareSelection() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    setIds(readIds());
    const handler = () => setIds(readIds());
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const isSelected = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback((id: string) => {
    const current = readIds();
    let next: string[];
    if (current.includes(id)) {
      next = current.filter((x) => x !== id);
    } else {
      if (current.length >= MAX_COMPARE_PRODUCTS) return false;
      next = [...current, id];
    }
    writeIds(next);
    setIds(next);
    return true;
  }, []);

  const remove = useCallback((id: string) => {
    const next = readIds().filter((x) => x !== id);
    writeIds(next);
    setIds(next);
  }, []);

  const clear = useCallback(() => {
    writeIds([]);
    setIds([]);
  }, []);

  return { ids, isSelected, toggle, remove, clear, isFull: ids.length >= MAX_COMPARE_PRODUCTS };
}
