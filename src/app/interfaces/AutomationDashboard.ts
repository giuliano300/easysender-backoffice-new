export interface AutomationDashboard {
  generatedAt: string;
  environment: string;
  broker: AutomationBroker;
  totals: AutomationTotals;
  systems: AutomationSystem[];
  queues: AutomationQueue[];
  posteCallClaims: AutomationPosteCallClaim[];
  productErrors: AutomationProductError[];
  backlog: AutomationBacklog[];
  recentIssues: AutomationRecentIssue[];
}

export interface AutomationBroker {
  host: string;
  reachable: boolean;
  status: string;
  error?: string | null;
}

export interface AutomationTotals {
  systems: number;
  runningSystems: number;
  rabbitMessages: number;
  rabbitConsumers: number;
  posteCallClaims: number;
  posteCallClaims24h: number;
  totalErrors: number;
  dbErrors24h: number;
  dbQueued: number;
  dbProcessing: number;
  stuckItems: number;
}

export interface AutomationSystem {
  product: string;
  step: string;
  displayName: string;
  queueName: string;
  status: string;
  rabbitMessages: number;
  rabbitConsumers: number;
  dbQueued: number;
  dbProcessed24h: number;
  dbErrors24h: number;
  stuckItems: number;
  lastActivityAt?: string | null;
  note?: string | null;
}

export interface AutomationQueue {
  name: string;
  exists: boolean;
  messages: number;
  consumers: number;
  status: string;
  error?: string | null;
}

export interface AutomationPosteCallClaim {
  product: string;
  step: string;
  total: number;
  last24h: number;
  lastCreatedAt?: string | null;
  productErrors: number;
  productErrors24h: number;
}

export interface AutomationProductError {
  product: string;
  productType: number;
  totalErrors: number;
  errors24h: number;
}

export interface AutomationBacklog {
  product: string;
  step: string;
  status: string;
  count: number;
}

export interface AutomationRecentIssue {
  recipientId: number;
  product: string;
  currentState: string;
  message?: string | null;
  insertDate: string;
}
