import React, { createContext, useContext, useMemo, useState } from "react";

export type CompareCar = any; // replace later with your Vehicle type

type CompareContextValue = {
  compareCart: CompareCar[];
  addToCompareCart: (car: CompareCar) => void;
  removeFromCompareCart: (carId: string) => void;
  clearCompareCart: () => void;
  isInCompareCart: (carId: string) => boolean;
  compareLimit: number;
  isCompareFull: boolean;
};

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const compareLimit = 5;
  const [compareCart, setCompareCart] = useState<CompareCar[]>([]);

  const addToCompareCart = (car: CompareCar) => {
    setCompareCart((prev) => {
      if (prev.some((c) => c.id === car.id)) return prev; // no duplicates
      if (prev.length >= compareLimit) return prev; // cap at 5
      return [...prev, car]; // keep add order
    });
  };

  const removeFromCompareCart = (carId: string) => {
    setCompareCart((prev) => prev.filter((c) => c.id !== carId));
  };

  const clearCompareCart = () => setCompareCart([]);

  const isInCompareCart = (carId: string) => compareCart.some((c) => c.id === carId);

  const value = useMemo(
    () => ({
      compareCart,
      addToCompareCart,
      removeFromCompareCart,
      clearCompareCart,
      isInCompareCart,
      compareLimit,
      isCompareFull: compareCart.length >= compareLimit,
    }),
    [compareCart]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside CompareProvider");
  return ctx;
}