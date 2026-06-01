"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface FilterAssignmentValue {
  isAssigned: (id: string) => boolean;
  toggle: (id: string) => void;
}

const FilterAssignmentContext = createContext<FilterAssignmentValue | null>(null);

export function useFilterAssignment(): FilterAssignmentValue {
  const ctx = useContext(FilterAssignmentContext);
  if (!ctx)
    throw new Error("useFilterAssignment fora do <FilterAssignmentProvider>");
  return ctx;
}

export function FilterAssignmentProvider({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const storageKey = `filter-assignment:${page}`;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setAssigned(raw ? new Set(JSON.parse(raw) as string[]) : new Set());
    } catch {
      setAssigned(new Set());
    }
  }, [storageKey]);

  const toggle = useCallback(
    (id: string) => {
      setAssigned((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
        }
        return next;
      });
    },
    [storageKey],
  );

  const isAssigned = useCallback((id: string) => assigned.has(id), [assigned]);

  return (
    <FilterAssignmentContext.Provider value={{ isAssigned, toggle }}>
      {children}
    </FilterAssignmentContext.Provider>
  );
}
