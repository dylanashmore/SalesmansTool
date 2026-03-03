import React, { createContext, useContext, useMemo, useState } from "react";

type ZipContextValue = {
  zip: string;
  setZip: (zip: string) => void;
  clearZip: () => void;
};

const ZipContext = createContext<ZipContextValue | null>(null);

export function ZipProvider({ children }: { children: React.ReactNode }) {
  const [zip, setZipState] = useState("");

  const setZip = (nextZip: string) => {
    setZipState(nextZip);
  };

  const clearZip = () => setZipState("");

  const value = useMemo(
    () => ({ zip, setZip, clearZip }),
    [zip]
  );

  return <ZipContext.Provider value={value}>{children}</ZipContext.Provider>;
}

export function useZip() {
  const ctx = useContext(ZipContext);
  if (!ctx) throw new Error("useZip must be used within a ZipProvider");
  return ctx;
}
