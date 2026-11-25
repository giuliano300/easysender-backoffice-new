import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { AccountingMovement, AccountingPosition, AccountingSummary } from '../../interfaces/accounting';
import { CompleteUser } from '../../interfaces/CompleteUser';
import { AccountingService } from '../../services/accounting.service';
import { CsvExportService } from '../../services/csv-export.service';
import { UsersService } from '../../services/users.service';

@Component({
  standalone: true,
  selector: 'app-accounting',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTableModule, FeathericonsModule, CurrencyPipe, DatePipe],
  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.scss'
})
export class AccountingComponent implements OnInit {
  summary?: AccountingSummary;
  positions: AccountingPosition[] = [];
  readonly displayedColumns = ['user', 'date', 'accrued', 'collected', 'residual', 'status', 'actions'];
  users: CompleteUser[] = [];
  selected?: AccountingPosition;
  movements: AccountingMovement[] = [];
  loading = false;
  saving = false;
  exporting = false;
  loadError = '';
  actionError = '';
  movementError = '';
  movementSuccess = '';
  editing = false;
  readonly today = new Date();

  filters;
  positionForm;
  movementForm;
  editForm;

  constructor(private fb: FormBuilder, private accounting: AccountingService, private usersService: UsersService, private csv: CsvExportService, private dialog: MatDialog) {
    this.filters = this.fb.group({ search: [''], userId: [null as number | null], status: [''], dueFrom: [null as Date | null], dueTo: [null as Date | null] });
    this.positionForm = this.fb.group({ userId: [null as number | null], description: [''], contractReference: [''], accruedAmount: [null as number | null], dueDate: [new Date()], notes: [''] });
    this.movementForm = this.fb.group({ type: ['payment'], amount: [null as number | null], movementDate: [new Date()], notes: [''] });
    this.editForm = this.fb.group({ description: [''], contractReference: [''], accruedAmount: [null as number | null], dueDate: [null as Date | null], notes: [''] });
  }

  ngOnInit(): void {
    this.usersService.getUsers('', 0, true).subscribe(users => {
      this.users = users.filter(item => item.user.parentId === 0 && item.user.accountOwnerId == null);
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    this.loadError = '';
    const filters = this.filters.getRawValue();
    this.accounting.getSummary().subscribe({ next: summary => this.summary = summary });
    this.accounting.getPositions({
      search: filters.search?.trim() || undefined,
      userId: filters.userId ?? undefined,
      status: filters.status || undefined,
      dueFrom: filters.dueFrom ?? undefined,
      dueTo: filters.dueTo ?? undefined
    }).subscribe({ next: result => { this.positions = result.data; this.loading = false; }, error: () => { this.positions = []; this.loading = false; this.loadError = 'Impossibile caricare le posizioni contabili. Riprova.'; } });
  }

  resetFilters(): void { this.filters.reset({ search: '', userId: null, status: '', dueFrom: null, dueTo: null }); this.load(); }

  select(position: AccountingPosition, scrollToDetail = false): void {
    this.editing = false; this.actionError = '';
    this.accounting.getPosition(position.id).subscribe({ next: result => { this.selected = result.position; this.movements = result.movements; if (scrollToDetail) requestAnimationFrame(() => document.getElementById('accounting-position-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }, error: () => this.actionError = 'Impossibile caricare il dettaglio della posizione.' });
  }

  startEdit(position: AccountingPosition): void {
    this.selected = position; this.editing = true; this.actionError = '';
    this.editForm.reset({ description: position.description, contractReference: position.contractReference ?? '', accruedAmount: position.accruedAmount, dueDate: new Date(position.dueDate), notes: position.notes ?? '' });
  }

  saveEdit(): void {
    if (!this.selected || this.saving) return;
    const value = this.editForm.getRawValue();
    if (!value.description?.trim() || !value.accruedAmount || value.accruedAmount <= 0 || !value.dueDate) { this.actionError = 'Inserisci descrizione, importo positivo e scadenza.'; return; }
    const id = this.selected.id;
    this.saving = true; this.actionError = '';
    this.accounting.updatePosition(id, { ...value, userId: this.selected.userId, closed: this.selected.closed }).subscribe({
      next: () => { this.saving = false; this.editing = false; this.accounting.getPosition(id).subscribe(result => { this.selected = result.position; this.movements = result.movements; }); this.load(); },
      error: () => { this.saving = false; this.actionError = 'Impossibile salvare la posizione.'; }
    });
  }

  deletePosition(position: AccountingPosition): void {
    if (this.saving) return;
    this.dialog.open(ConfirmDialogComponent, { width: '420px', maxWidth: '95vw', data: { eyebrow: 'POSIZIONE CONTABILE', title: 'Eliminare la posizione?', message: `La posizione “${position.description}” di ${position.userName} sarà eliminata definitivamente. Le posizioni con movimenti non possono essere eliminate.`, confirmLabel: 'Elimina' } }).afterClosed().subscribe(confirmed => {
      if (!confirmed || this.saving) return;
      this.saving = true; this.actionError = '';
      this.accounting.deletePosition(position.id).subscribe({ next: () => { this.saving = false; if (this.selected?.id === position.id) this.selected = undefined; this.editing = false; this.load(); }, error: error => { this.saving = false; this.actionError = error?.error?.message || 'Impossibile eliminare la posizione.'; } });
    });
  }

  createPosition(): void {
    if (this.saving || this.positionForm.invalid) return;
    const value = this.positionForm.getRawValue();
    if (!value.userId || !value.description?.trim() || !value.accruedAmount || !value.dueDate) return;
    this.saving = true;
    this.accounting.createPosition({ ...value, description: value.description.trim(), dueDate: value.dueDate }).subscribe({
      next: () => { this.positionForm.reset({ userId: null, description: '', contractReference: '', accruedAmount: null, dueDate: new Date(), notes: '' }); this.saving = false; this.load(); },
      error: () => this.saving = false
    });
  }

  addMovement(): void {
    if (!this.selected || this.saving) return;
    const value = this.movementForm.getRawValue();
    this.movementError = ''; this.movementSuccess = '';
    if (!value.amount || value.amount <= 0 || !value.movementDate || !value.type) { this.movementError = 'Inserisci tipo, importo positivo e data del movimento.'; return; }
    this.saving = true;
    const id = this.selected.id;
    const date = value.movementDate;
    const movementDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
    this.accounting.addMovement(id, { ...value, movementDate }).subscribe({
      next: () => { this.movementForm.reset({ type: 'payment', amount: null, movementDate: new Date(), notes: '' }); this.saving = false; this.movementSuccess = 'Movimento registrato.'; this.accounting.getPosition(id).subscribe({ next: result => { this.selected = result.position; this.movements = result.movements; }, error: () => this.movementError = 'Movimento salvato, ma il dettaglio non è stato aggiornato.' }); this.load(); },
      error: error => { this.saving = false; this.movementError = typeof error?.error === 'string' && error.error.length < 250 ? error.error : error?.error?.message || `Registrazione non riuscita (HTTP ${error.status || 'non disponibile'}).`; }
    });
  }

  deleteMovement(movement: AccountingMovement): void {
    if (!this.selected || this.saving) return;
    const id = this.selected.id;
    this.dialog.open(ConfirmDialogComponent, { width: '420px', maxWidth: '95vw', data: { eyebrow: 'MOVIMENTO CONTABILE', title: 'Rimuovere il movimento?', message: 'Il movimento sarà eliminato definitivamente e i totali della posizione saranno ricalcolati.', confirmLabel: 'Rimuovi' } }).afterClosed().subscribe(confirmed => {
      if (!confirmed || this.saving) return;
      this.removeMovement(id, movement.id);
    });
  }

  private removeMovement(id: number, movementId: number): void {
    this.saving = true; this.movementError = ''; this.movementSuccess = '';
    this.accounting.deleteMovement(id, movementId).subscribe({
      next: () => { this.saving = false; this.movementSuccess = 'Movimento eliminato.'; this.accounting.getPosition(id).subscribe({ next: result => { this.selected = result.position; this.movements = result.movements; }, error: () => this.movementError = 'Movimento eliminato, ma il dettaglio non è stato aggiornato.' }); this.load(); },
      error: error => { this.saving = false; this.movementError = error.status === 404 ? 'Movimento non trovato oppure API non aggiornata: verifica che il nuovo backend sia pubblicato.' : error?.error?.message || `Impossibile eliminare il movimento (HTTP ${error.status || 'non disponibile'}).`; }
    });
  }

  positionStatus(position: AccountingPosition): 'paid' | 'overdue' | 'open' {
    if (position.isPaid) return 'paid';
    return new Date(position.dueDate).getTime() < new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()).getTime() ? 'overdue' : 'open';
  }

  exportCsv(): void {
    if (this.exporting) return;
    this.exporting = true;
    this.csv.download('contabilita-clienti', this.positions, [
      { header: 'Cliente', value: row => row.userName },
      { header: 'Descrizione', value: row => row.description },
      { header: 'Contratto/Riferimento', value: row => row.contractReference },
      { header: 'Scadenza', value: row => new Date(row.dueDate).toLocaleDateString('it-IT') },
      { header: 'Maturato', value: row => row.accruedAmount },
      { header: 'Rettifiche', value: row => row.creditAmount },
      { header: 'Incassato', value: row => row.collectedAmount },
      { header: 'Residuo', value: row => row.residualAmount },
      { header: 'Stato', value: row => this.positionStatus(row) === 'paid' ? 'Pagata' : this.positionStatus(row) === 'overdue' ? 'Scaduta' : 'Da pagare' }
    ]);
    this.exporting = false;
  }
}
