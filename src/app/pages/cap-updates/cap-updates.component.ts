import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CapUpdatesStatus } from '../../interfaces/cap-updates';
import { CapUpdatesService } from '../../services/cap-updates.service';
@Component({ standalone: true, selector: 'app-cap-updates', imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, DatePipe], templateUrl: './cap-updates.component.html', styleUrl: './cap-updates.component.scss' })
export class CapUpdatesComponent implements OnInit, OnDestroy {
  data?: CapUpdatesStatus; loading = true; saving = false; message = ''; error = ''; private timer?: ReturnType<typeof setInterval>;
  form;
  constructor(private readonly fb: FormBuilder, private readonly api: CapUpdatesService) {
    this.form = this.fb.group({ enabled: [true], checkIntervalHours: [168], sourceUrl: ['https://www.poste.it/cap/'], archiveRoot: ['B:\\EasySenderFiles\\cap-updates'], frontendCapFile: [''], backofficeCapFile: [''] });
  }
  ngOnInit(): void { this.load(); this.timer = setInterval(() => this.load(true), 10000); }
  ngOnDestroy(): void { if (this.timer) clearInterval(this.timer); }
  load(silent = false): void { if (!silent) this.loading = true; this.api.get().subscribe({ next: value => { this.data = value; if (!this.form.dirty) this.form.patchValue(value.configuration, { emitEvent: false }); this.loading = false; }, error: () => { this.loading = false; this.error = 'Impossibile leggere il sistema CAP. Verificare script SQL e API.'; } }); }
  save(): void { this.saving = true; this.error = ''; this.api.save(this.form.getRawValue() as any).subscribe({ next: () => { this.saving = false; this.form.markAsPristine(); this.message = 'Configurazione salvata.'; this.load(true); }, error: e => { this.saving = false; this.error = e?.error || 'Configurazione non valida.'; } }); }
  check(): void { this.api.checkNow().subscribe({ next: () => { this.message = 'Controllo richiesto: il servizio lo eseguirà entro un minuto.'; this.load(true); }, error: e => this.error = e?.error || 'Richiesta non riuscita.' }); }
  apply(): void { this.api.apply().subscribe({ next: () => { this.message = 'Applicazione richiesta: il servizio creerà prima una copia .backup dei file CAP.'; this.load(true); }, error: e => this.error = e?.error || 'Applicazione non riuscita.' }); }
}
