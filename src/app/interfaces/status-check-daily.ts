export interface StatusCheckDailyProduct {
  product: string;
  batches: number;
  requested: number;
  returned: number;
  changed: number;
  finalStates: number;
  duplicates: number;
  unmatched: number;
  noOutcomes: number;
  failed: number;
}

export interface StatusCheckDailyRun {
  id: number;
  product: string;
  userName: string;
  startedAt: string;
  completedAt: string;
  requestedCount: number;
  returnedCount: number;
  statusChangedCount: number;
  duplicateCount: number;
  unmatchedCount: number;
  finalStateCount: number;
  outcome: 'completed' | 'no_outcomes' | 'failed';
  error?: string | null;
}

export interface StatusCheckDaily {
  date: string;
  from: string;
  to: string;
  totals: { batches: number; requested: number; returned: number; changed: number; finalStates: number; failed: number; noOutcomes: number; };
  byProduct: StatusCheckDailyProduct[];
  runs: StatusCheckDailyRun[];
}

export interface StatusCheckRunShipment {
  recipientId: number;
  recipientName: string;
  code?: string | null;
  city?: string | null;
  province?: string | null;
  previousStatusCode?: string | null;
  previousMessage?: string | null;
  statusCode?: string | null;
  statusMessage?: string | null;
  changed: boolean;
  finalState: boolean;
  recordedAt: string;
}

export interface StatusCheckRunDetails {
  run: Pick<StatusCheckDailyRun, 'id' | 'product' | 'startedAt' | 'completedAt'>;
  shipments: StatusCheckRunShipment[];
}
