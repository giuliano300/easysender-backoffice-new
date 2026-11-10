export interface DisasterRecoveryConfiguration {
  enabled: boolean;
  scheduledTime: string;
  primaryBackupRoot: string;
  secondaryBackupRoot: string;
  offsiteBackupRoot?: string | null;
  dailyRetentionDays: number;
  weeklyRetentionWeeks: number;
  monthlyRetentionMonths: number;
  updatedAt: string;
  manualRunRequestedAt?: string | null;
  manualRunExecutedAt?: string | null;
}

export type UpdateDisasterRecoveryConfiguration = Pick<DisasterRecoveryConfiguration,
  'enabled' | 'scheduledTime' | 'primaryBackupRoot' | 'secondaryBackupRoot' | 'offsiteBackupRoot' |
  'dailyRetentionDays' | 'weeklyRetentionWeeks' | 'monthlyRetentionMonths'>;

export interface DisasterRecoveryRun {
  id: number;
  startedAt: string;
  completedAt?: string | null;
  trigger: string;
  status: string;
  backupFile?: string | null;
  backupSizeBytes?: number | null;
  error?: string | null;
}

export interface DisasterRecoveryStatus {
  configuration: DisasterRecoveryConfiguration;
  lastRun?: DisasterRecoveryRun | null;
  recentRuns: DisasterRecoveryRun[];
}
