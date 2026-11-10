import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DisasterRecoveryRun, DisasterRecoveryStatus, UpdateDisasterRecoveryConfiguration } from '../../interfaces/disaster-recovery';
import { DisasterRecoveryService } from '../../services/disaster-recovery.service';

@Component({
  standalone: true,
  selector: 'app-disaster-recovery',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule, DatePipe],
  templateUrl: './disaster-recovery.component.html',
  styleUrl: './disaster-recovery.component.scss'
})
export class DisasterRecoveryComponent implements OnInit, OnDestroy {
  data?: DisasterRecoveryStatus;
  loading = true;
  saving = false;
  running = false;
  message = '';
  error = '';
  private refresh?: ReturnType<typeof setInterval>;
  form;

  constructor(private readonly fb: FormBuilder, private readonly disasterRecovery: DisasterRecoveryService) {
    this.form = this.fb.group({
      enabled: [true], scheduledTime: ['02:15'], primaryBackupRoot: ['B:\\EasySenderBackups'], secondaryBackupRoot: ['C:\\EasySenderBackups'], offsiteBackupRoot: [''],
      dailyRetentionDays: [31], weeklyRetentionWeeks: [12], monthlyRetentionMonths: [36]
    });
  }

  ngOnInit(): void { this.load(); this.refresh = setInterval(() => this.load(true), 10000); }
  ngOnDestroy(): void { if (this.refresh) clearInterval(this.refresh); }

  load(silent = false): void {
    if (!silent) this.loading = true;
    this.disasterRecovery.get().subscribe({
      next: value => {
        this.data = value;
        if (!silent || !this.form.dirty) {
          this.form.patchValue(value.configuration, { emitEvent: false });
          this.form.markAsPristine();
        }
        this.loading = false;
        const manualPending = !!value.configuration.manualRunRequestedAt &&
          (!value.configuration.manualRunExecutedAt || new Date(value.configuration.manualRunRequestedAt) > new Date(value.configuration.manualRunExecutedAt));
        if (value.lastRun?.status !== 'running' && !manualPending) this.running = false;
      },
      error: () => { this.loading = false; this.error = 'Impossibile leggere lo stato del disaster recovery. Verificare che lo script SQL sia stato eseguito e che le API siano aggiornate.'; }
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true; this.error = ''; this.message = '';
    const raw = this.form.getRawValue();
    const payload: UpdateDisasterRecoveryConfiguration = {
      enabled: !!raw.enabled,
      scheduledTime: raw.scheduledTime || '',
      primaryBackupRoot: raw.primaryBackupRoot || '',
      secondaryBackupRoot: raw.secondaryBackupRoot || '',
      offsiteBackupRoot: raw.offsiteBackupRoot || null,
      dailyRetentionDays: Number(raw.dailyRetentionDays) || 0,
      weeklyRetentionWeeks: Number(raw.weeklyRetentionWeeks) || 0,
      monthlyRetentionMonths: Number(raw.monthlyRetentionMonths) || 0
    };
    this.disasterRecovery.save(payload).subscribe({
      next: saved => { this.saving = false; this.form.patchValue(saved); this.form.markAsPristine(); this.message = 'Configurazione salvata. Il servizio applicherà le modifiche entro 30 secondi.'; this.load(true); },
      error: err => { this.saving = false; this.error = err?.error || 'Configurazione non salvata.'; }
    });
  }

  runNow(): void {
    if (this.running) return;
    this.running = true; this.error = ''; this.message = '';
    this.disasterRecovery.runNow().subscribe({
      next: () => { this.message = 'Esecuzione richiesta. Il servizio inizierà il backup entro 30 secondi.'; this.load(true); },
      error: err => { this.running = false; this.error = err?.error || 'Impossibile richiedere il backup.'; }
    });
  }

  runStatus(run?: DisasterRecoveryRun | null): string {
    if (!run) return 'Mai eseguito';
    return run.status === 'completed' ? 'Completato' : run.status === 'failed' ? 'Non riuscito' : 'In esecuzione';
  }

  fileSize(value?: number | null): string {
    if (!value) return '—';
    return value >= 1073741824 ? `${(value / 1073741824).toFixed(2)} GB` : `${(value / 1048576).toFixed(1)} MB`;
  }
}
