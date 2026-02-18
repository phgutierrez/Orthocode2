import { useState, useEffect, useCallback } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface SortableItem {
    id: string;
}

/**
 * useSortablePackages - manages local drag-and-drop order for a list of packages.
 * Persists order to localStorage under the given storageKey.
 */
export function useSortablePackages<T extends SortableItem>(
    items: T[],
    storageKey: string
) {
    const [orderedItems, setOrderedItems] = useState<T[]>([]);

    // Sync with incoming items, preserving saved order
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const savedOrder: string[] = JSON.parse(saved);
                const itemMap = new Map(items.map((item) => [item.id, item]));
                // Reorder by saved order, then append any new items not in saved order
                const reordered = [
                    ...savedOrder.map((id) => itemMap.get(id)).filter(Boolean) as T[],
                    ...items.filter((item) => !savedOrder.includes(item.id)),
                ];
                setOrderedItems(reordered);
                return;
            } catch {
                // Invalid JSON — fall through to default
            }
        }
        setOrderedItems(items);
    }, [items, storageKey]);

    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            const { active, over } = event;
            if (!over || active.id === over.id) return;

            setOrderedItems((prev) => {
                const oldIndex = prev.findIndex((item) => item.id === active.id);
                const newIndex = prev.findIndex((item) => item.id === over.id);
                const next = arrayMove(prev, oldIndex, newIndex);
                // Persist new order
                localStorage.setItem(storageKey, JSON.stringify(next.map((i) => i.id)));
                return next;
            });
        },
        [storageKey]
    );

    const resetOrder = useCallback(() => {
        localStorage.removeItem(storageKey);
        setOrderedItems(items);
    }, [items, storageKey]);

    return { orderedItems, handleDragEnd, resetOrder };
}
