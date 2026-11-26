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
  shipmentSummary?: { total: number; final: number; nonFinal: number; };
  date: string;
  from: string;
  to: string;
  totals: { batches: number; requested: number; returned: number; changed: number; finalStates: number; failed: number; noOutcomes: number; };
  byProduct: StatusCheckDailyProduct[];
  totalRuns: number;
  pageIndex: number;
  pageSize: number;
  runFilter?: StatusCheckRunFilter | null;
  staleShipmentsCount: number;
  runs: StatusCheckDailyRun[];
}

export type StatusCheckRunFilter = 'changed' | 'final' | 'no_outcomes' | 'failed';

export interface StatusCheckRunShipment {
  recipientId: number;
  recipientName: string;
  code?: string | null;
  city?: string | null;
  province?: string | null;
  takenInChargeAt?: string | null;
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

export interface StatusRecognitionIssue {
  id: number;
  code?: string | null;
  requestId?: string | null;
  product: string;
  recipientName: string;
  userName: string;
  message: string;
  lastStatusAt: string;
  maximumDays: number;
  elapsedDays: number;
  canRetry: boolean;
}

export interface StatusRecognitionIssues {
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  rows: StatusRecognitionIssue[];
}
