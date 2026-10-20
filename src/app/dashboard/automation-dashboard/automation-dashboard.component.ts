import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AutomationDashboard, AutomationSystem } from '../../interfaces/AutomationDashboard';
import { AutomationRuntimeSetting } from '../../interfaces/AutomationRuntimeSetting';
import { AutomationDashboardService } from '../../services/automation-dashboard.service';
import { AutomationSettingsService } from '../../services/automation-settings.service';

@Component({
  selector: 'app-automation-dashboard',
  imports: [DatePipe, DecimalPipe, NgClass, NgFor, NgIf, MatCardModule, MatProgressBarModule],
  templateUrl: './automation-dashboard.component.html',
  styleUrl: './automation-dashboard.component.scss'
})
export class AutomationDashboardComponent implements OnInit, OnDestroy {
  dashboard: AutomationDashboard | null = null;
  loading = true;
  error = '';
  settingsOpened = false;
  settingsLoading = false;
  settingsError = '';
  settings: AutomationRuntimeSetting[] = [];
  savingKey = '';
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private automationDashboardService: AutomationDashboardService, private automationSettingsService: AutomationSettingsService) {}

  ngOnInit(): void {
    this.load();
    this.intervalId = setInterval(() => this.load(), 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  load(): void {
    this.automationDashboardService.getDashboard().subscribe({
      next: data => {
        this.dashboard = data;
        this.loading = false;
        this.error = '';
      },
      error: () => {
        this.loading = false;
        this.error = 'Impossibile leggere lo stato dei sistemi.';
      }
    });
  }

  get groupedSystems(): { product: string; systems: AutomationSystem[] }[] {
    const groups = new Map<string, AutomationSystem[]>();

    for (const system of this.visibleSystems) {
      const items = groups.get(system.product) ?? [];
      items.push(system);
      groups.set(system.product, items);
    }

    return Array.from(groups.entries()).map(([product, systems]) => ({ product, systems }));
  }

  get visibleSystems(): AutomationSystem[] {
    return (this.dashboard?.systems ?? []).filter(system => !this.isStatusCheckSystem(system));
  }

  get groupedSettings(): { service: string; settings: AutomationRuntimeSetting[] }[] {
    const groups = new Map<string, AutomationRuntimeSetting[]>();
    for (const setting of this.settings) {
      const values = groups.get(setting.service) ?? [];
      values.push(setting);
      groups.set(setting.service, values);
    }
    return Array.from(groups.entries()).map(([service, settings]) => ({ service, settings }));
  }

  openSettings(): void {
    this.settingsOpened = true;
    if (this.settings.length === 0 && !this.settingsLoading) {
      this.loadSettings();
    }
  }

  closeSettings(): void {
    this.settingsOpened = false;
    this.load();
  }

  loadSettings(): void {
    this.settingsLoading = true;
    this.settingsError = '';
    this.automationSettingsService.getAll().subscribe({
      next: settings => { this.settings = settings; this.settingsLoading = false; },
      error: () => { this.settingsLoading = false; this.settingsError = 'Impossibile leggere la configurazione delle automazioni.'; }
    });
  }

  setTime(setting: AutomationRuntimeSetting, field: 'startTime' | 'endTime', value: string): void {
    setting[field] = value || null;
  }

  setInterval(setting: AutomationRuntimeSetting, value: string): void {
    setting.intervalMinutes = Math.max(1, Math.min(1440, Number(value) || 1));
  }

  setBatchSize(setting: AutomationRuntimeSetting, value: string): void {
    setting.batchSize = Math.max(1, Math.min(500, Number(value) || 1));
  }

  saveSetting(setting: AutomationRuntimeSetting): void {
    this.savingKey = setting.automationKey;
    this.automationSettingsService.save(setting).subscribe({
      next: saved => { this.replaceSetting(saved); this.savingKey = ''; this.load(); },
      error: () => { this.settingsError = 'Impossibile salvare la configurazione.'; this.savingKey = ''; }
    });
  }

  toggleSetting(setting: AutomationRuntimeSetting): void {
    setting.enabled = !setting.enabled;
    this.saveSetting(setting);
  }

  restartSetting(setting: AutomationRuntimeSetting): void {
    this.savingKey = setting.automationKey;
    this.automationSettingsService.restart(setting).subscribe({
      next: saved => { this.replaceSetting(saved); this.savingKey = ''; },
      error: () => { this.settingsError = 'Impossibile riavviare la fase.'; this.savingKey = ''; }
    });
  }

  runNow(setting: AutomationRuntimeSetting): void {
    this.savingKey = setting.automationKey;
    this.automationSettingsService.runNow(setting).subscribe({
      next: saved => { this.replaceSetting(saved); this.savingKey = ''; },
      error: () => { this.settingsError = 'Impossibile inviare il comando di esecuzione immediata.'; this.savingKey = ''; }
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      running: 'In esecuzione',
      idle: 'In attesa',
      warning: 'Da verificare',
      blocked: 'Bloccato',
      missing: 'Coda mancante',
      offline: 'Offline',
      online: 'Online',
      'no-consumer': 'Nessun processo attivo',
      'broker-down': 'Broker down',
      unknown: 'Sconosciuto'
    };

    return labels[status] ?? status;
  }

  statusDescription(system: AutomationSystem): string {
    const descriptions: Record<string, string> = {
      running: 'Consumer attivo',
      idle: 'Nessun lavoro ora',
      warning: 'Da controllare',
      blocked: 'Nessun consumer sulla coda',
      missing: 'Coda RabbitMQ assente',
      offline: 'RabbitMQ non raggiungibile',
      unknown: 'Non determinato'
    };

    return descriptions[system.status] ?? 'Non determinato';
  }

  private isStatusCheckSystem(system: AutomationSystem): boolean {
    return this.containsStatusCheckText(`${system.step} ${system.displayName} ${system.queueName}`);
  }

  private containsStatusCheckText(value: string): boolean {
    const normalized = value.toLowerCase();
    return normalized.includes('controllastato') ||
      normalized.includes('controlla_stato') ||
      normalized.includes('controlla stato');
  }

  private replaceSetting(saved: AutomationRuntimeSetting): void {
    this.settings = this.settings.map(setting => setting.automationKey === saved.automationKey ? saved : setting);
  }
}
