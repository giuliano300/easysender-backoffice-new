import { DatePipe, DecimalPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AutomationDashboard, AutomationSystem } from '../../interfaces/AutomationDashboard';
import { AutomationDashboardService } from '../../services/automation-dashboard.service';

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
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private automationDashboardService: AutomationDashboardService) {}

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
        this.dashboard = this.withoutStatusCheckSystems(data);
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

  private withoutStatusCheckSystems(data: AutomationDashboard): AutomationDashboard {
    const systems = data.systems.filter(system => !this.isStatusCheckSystem(system));
    const queues = data.queues.filter(queue => !this.containsStatusCheckText(queue.name));
    const backlog = data.backlog.filter(row => !this.containsStatusCheckText(`${row.step} ${row.status}`));
    const posteCallClaims = data.posteCallClaims ?? [];
    const productErrors = data.productErrors ?? [];

    return {
      ...data,
      systems,
      queues,
      backlog,
      posteCallClaims,
      productErrors,
      totals: {
        ...data.totals,
        systems: systems.length,
        runningSystems: systems.filter(system => system.status === 'running').length,
        rabbitMessages: systems.reduce((total, system) => total + system.rabbitMessages, 0),
        rabbitConsumers: systems.reduce((total, system) => total + system.rabbitConsumers, 0),
        posteCallClaims: posteCallClaims.reduce((total, row) => total + row.total, 0),
        posteCallClaims24h: posteCallClaims.reduce((total, row) => total + row.last24h, 0),
        totalErrors: productErrors.reduce((total, row) => total + row.totalErrors, 0),
        dbErrors24h: productErrors.reduce((total, row) => total + row.errors24h, 0)
      }
    };
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
}
