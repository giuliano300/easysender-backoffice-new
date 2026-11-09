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
import { AccountingMovement, AccountingPosition, AccountingSummary } from '../../interfaces/accounting';
import { CompleteUser } from '../../interfaces/CompleteUser';
import { AccountingService } from '../../services/accounting.service';
import { CsvExportService } from '../../services/csv-export.service';
import { UsersService } from '../../services/users.service';

@Component({
  standalone: true,
  selector: 'app-accounting',
  imports: [CommonModule, ReactiveFormsModule, MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, MatSelectModule, CurrencyPipe, DatePipe],
  templateUrl: './accounting.component.html',
  styleUrl: './accounting.component.scss'
})
export class AccountingComponent implements OnInit {
  summary?: AccountingSummary;
  positions: AccountingPosition[] = [];
  users: CompleteUser[] = [];
  selected?: AccountingPosition;
  movements: AccountingMovement[] = [];
  loading = false;
  saving = false;
  exporting = false;
  readonly today = new Date();

  filters;
  positionForm;
  movementForm;

  constructor(private fb: FormBuilder, private accounting: AccountingService, private usersService: UsersService, private csv: CsvExportService) {
    this.filters = this.fb.group({ search: [''], userId: [null as number | null], status: [''], dueFrom: [null as Date | null], dueTo: [null as Date | null] });
    this.positionForm = this.fb.group({ userId: [null as number | null], description: [''], contractReference: [''], accruedAmount: [null as number | null], dueDate: [new Date()], notes: [''] });
    this.movementForm = this.fb.group({ type: ['payment'], amount: [null as number | null], movementDate: [new Date()], notes: [''] });
  }

  ngOnInit(): void {
    this.usersService.getUsers('', 0, true).subscribe(users => {
      this.users = users.filter(item => item.user.parentId === 0 && item.user.accountOwnerId == null);
    });
    this.load();
  }

  load(): void {
    this.loading = true;
    const filters = this.filters.getRawValue();
    this.accounting.getSummary().subscribe({ next: summary => this.summary = summary });
    this.accounting.getPositions({
      search: filters.search?.trim() || undefined,
      userId: filters.userId ?? undefined,
      status: filters.status || undefined,
      dueFrom: filters.dueFrom ?? undefined,
      dueTo: filters.dueTo ?? undefined
    }).subscribe({ next: result => { this.positions = result.data; this.loading = false; }, error: () => this.loading = false });
  }

  resetFilters(): void { this.filters.reset({ search: '', userId: null, status: '', dueFrom: null, dueTo: null }); this.load(); }

  select(position: AccountingPosition): void {
    this.accounting.getPosition(position.id).subscribe(result => { this.selected = result.position; this.movements = result.movements; });
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
    if (!value.amount || !value.movementDate) return;
    this.saving = true;
    this.accounting.addMovement(this.selected.id, value).subscribe({
      next: () => { this.movementForm.reset({ type: 'payment', amount: null, movementDate: new Date(), notes: '' }); this.saving = false; this.select(this.selected!); this.load(); },
      error: () => this.saving = false
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
