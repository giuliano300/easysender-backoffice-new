export interface WatchdogCheck {
  checkKey: string;
  displayName: string;
  category: string;
  status: 'healthy' | 'failed' | 'missing';
  detail?: string;
  checkedAtUtc: string;
  lastHealthyAtUtc?: string;
  consecutiveFailures: number;
}

export interface WatchdogStatus {
  generatedAtUtc: string;
  healthy: number;
  issues: number;
  checks: WatchdogCheck[];
}
