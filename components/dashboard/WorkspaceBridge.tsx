"use client";

import { createContext, useCallback, useContext, useMemo, useRef } from "react";

export interface LoadTicketPayload {
  generatedTicket: string;
  screenshotUrl?: string | null;
  inputText?: string | null;
  ticketType?: string | null;
}

type LoadHandler = (payload: LoadTicketPayload) => void;

interface WorkspaceBridgeValue {
  loadTicket: (payload: LoadTicketPayload) => void;
  onLoadTicket: (handler: LoadHandler) => () => void;
}

const WorkspaceBridgeContext = createContext<WorkspaceBridgeValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const handlerRef = useRef<LoadHandler | null>(null);

  const loadTicket = useCallback((payload: LoadTicketPayload) => {
    handlerRef.current?.(payload);
  }, []);

  const onLoadTicket = useCallback((handler: LoadHandler) => {
    handlerRef.current = handler;
    return () => {
      if (handlerRef.current === handler) handlerRef.current = null;
    };
  }, []);

  const value = useMemo(() => ({ loadTicket, onLoadTicket }), [loadTicket, onLoadTicket]);

  return (
    <WorkspaceBridgeContext.Provider value={value}>
      {children}
    </WorkspaceBridgeContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceBridgeContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
