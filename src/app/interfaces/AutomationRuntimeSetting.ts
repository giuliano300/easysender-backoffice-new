export interface AutomationRuntimeSetting {
  automationKey: string;
  service: string;
  phase: string;
  enabled: boolean;
  startTime?: string | null;
  endTime?: string | null;
  intervalMinutes: number;
  batchSize: number;
  updatedAt: string;
  restartRequestedAt?: string | null;
  manualRunRequestedAt?: string | null;
}
