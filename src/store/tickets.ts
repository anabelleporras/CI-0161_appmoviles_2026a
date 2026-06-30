import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { StateStorage } from "zustand/middleware";

import { apiFetch } from "@/services/api-client";
import type { Ticket } from "@/services/payments";

const secureStorage: StateStorage = {
  getItem: async (name) => (await SecureStore.getItemAsync(name)) ?? null,
  setItem: async (name, value) => await SecureStore.setItemAsync(name, value),
  removeItem: async (name) => await SecureStore.deleteItemAsync(name),
};

interface TicketsState {
  tickets: Ticket[];
  addTicket: (ticket: Ticket) => void;
  syncFromBackend: () => Promise<void>;
}

const byNewest = (a: Ticket, b: Ticket): number =>
  Date.parse(b.purchasedAt) - Date.parse(a.purchasedAt);

/**
 * Wallet store, mirroring `favorites`/`settings`: zustand persisted to secure-store.
 *
 * There is no write-queue here — you cannot buy offline, so tickets are always minted
 * server-side by `/tickets/confirm`. The store only *caches* them for offline viewing
 * and re-hydrates from the backend on login.
 */
export const useTicketsStore = create<TicketsState>()(
  persist(
    (set) => ({
      tickets: [],

      // The ticket is already minted server-side; we just cache it locally. Dedupe by
      // id so re-confirming the same PaymentIntent never adds a duplicate wallet row.
      addTicket: (ticket) =>
        set((state) => ({
          tickets: [
            ticket,
            ...state.tickets.filter((t) => t.id !== ticket.id),
          ].sort(byNewest),
        })),

      syncFromBackend: async () => {
        try {
          const res = await apiFetch("/tickets");
          if (!res.ok) return;
          const data = await res.json();
          const tickets: Ticket[] = (data.tickets ?? []).slice().sort(byNewest);
          set({ tickets });
        } catch {
          // offline — keep the locally cached tickets
        }
      },
    }),
    {
      name: "tickets-storage",
      storage: createJSONStorage(() => secureStorage),
    },
  ),
);
