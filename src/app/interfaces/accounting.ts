export interface AccountingPosition {
  id: number;
  userId: number;
  userName: string;
  description: string;
  contractReference?: string | null;
  accruedAmount: number;
  creditAmount: number;
  collectedAmount: number;
  residualAmount: number;
  dueDate: string;
  createdAt: string;
  notes?: string | null;
  isPaid: boolean;
}

export interface AccountingMovement {
  id: number;
  type: 'payment' | 'adjustment' | 'credit-note';
  amount: number;
  movementDate: string;
  notes?: string | null;
}

export interface AccountingSummary {
  accrued: number;
  collected: number;
  outstanding: number;
  overdue: number;
  nextThirtyDays: number;
  positions: number;
  customers: number;
  dueSoon: AccountingPosition[];
  aging: { current: number; days1To30: number; days31To60: number; days61To90: number; over90: number; };
}
