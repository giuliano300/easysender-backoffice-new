import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { OperationListItem } from '../../interfaces/OperationListItem';
import { SendsService } from '../../services/sends.service';
import { UsersService } from '../../services/users.service';
import { CompleteUser } from '../../interfaces/CompleteUser';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { CsvExportService } from '../../services/csv-export.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-operations',
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatDatepickerModule, MatNativeDateModule, MatTableModule, MatPaginatorModule, MatTooltipModule, FeathericonsModule, DatePipe],
  templateUrl: './operations.component.html',
  styleUrl: './operations.component.scss'
})
export class OperationsComponent implements OnInit {
  displayedColumns = ['id', 'date', 'name', 'user', 'recipients', 'progress', 'status', 'view', 'delete'];
  dataSource = new MatTableDataSource<OperationListItem>([]);
  form: FormGroup;
  totalRecords = 0;
  pageIndex = 0;
  pageSize = 20;
  loading = false;
  exportingCsv = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  users: CompleteUser[] = [];

  constructor(private fb: FormBuilder, private sendsService: SendsService, private usersService: UsersService, private csvExport: CsvExportService, private dialog: MatDialog, private router: Router) {
    const today = this.getToday();
    this.form = this.fb.group({ search: [''], start: [today], end: [today], userId: [null], userSearch: [''] });
  }

  ngOnInit(): void {
    this.load();
    this.usersService.getUsers('', 0, true).subscribe(users => this.users = users);
  }

  get filteredUsers(): CompleteUser[] {
    const term = String(this.form.value.userSearch ?? '').trim().toLocaleLowerCase('it-IT');
    return this.users.filter(item => !term || item.user.businessName?.toLocaleLowerCase('it-IT').includes(term)).slice(0, 50);
  }

  selectUser(user: CompleteUser): void {
    this.form.patchValue({ userId: user.user.id, userSearch: user.user.businessName }, { emitEvent: false });
  }

  clearSelectedUser(): void { this.form.patchValue({ userId: null }, { emitEvent: false }); }

  displayUser(user: CompleteUser | string | null): string { return typeof user === 'string' ? user : user?.user.businessName ?? ''; }

  resetFilters(): void {
    const today = this.getToday();
    this.form.reset({ search: '', start: today, end: today, userId: null, userSearch: '' });
    this.load(true);
  }

  private getToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  load(resetPage = false): void {
    if (resetPage) this.pageIndex = 0;
    this.loading = true;
    this.sendsService.getOperations({
      search: this.form.value.search?.trim() || undefined,
      userId: this.form.value.userId ?? undefined,
      startDate: this.form.value.start ? new Date(this.form.value.start) : undefined,
      endDate: this.form.value.end ? new Date(this.form.value.end) : undefined,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize
    }).subscribe({
      next: response => {
        this.dataSource.data = response.data;
        this.totalRecords = response.totalCount;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  progressTotal(item: OperationListItem): number {
    return Math.max(0, item.recipients - item.notifiedRecipients);
  }

  progressPercentage(item: OperationListItem): number {
    const total = this.progressTotal(item);
    return total === 0 ? 100 : Math.min(100, Math.round((item.acceptedRecipients / total) * 100));
  }

  async exportFilteredOperations(): Promise<void> {
    if (this.exportingCsv) return;

    this.exportingCsv = true;
    try {
      const filters = {
        search: this.form.value.search?.trim() || undefined,
        userId: this.form.value.userId ?? undefined,
        startDate: this.form.value.start ? new Date(this.form.value.start) : undefined,
        endDate: this.form.value.end ? new Date(this.form.value.end) : undefined,
        pageIndex: 0,
        pageSize: 200
      };
      const firstPage = await firstValueFrom(this.sendsService.getOperations(filters));
      const rows = [...firstPage.data];

      for (let pageIndex = 1; rows.length < firstPage.totalCount; pageIndex++) {
        const page = await firstValueFrom(this.sendsService.getOperations({ ...filters, pageIndex }));
        if (!page.data.length) break;
        rows.push(...page.data);
      }

      this.csvExport.download('operazioni-filtrate', rows, [
        { header: 'ID operazione', value: row => row.id },
        { header: 'Data creazione', value: row => new Date(row.insertDate).toLocaleString('it-IT') },
        { header: 'Operazione', value: row => row.name },
        { header: 'Utente', value: row => row.userName },
        { header: 'Invii', value: row => row.recipients },
        { header: 'Invii segnalati', value: row => row.notifiedRecipients },
        { header: 'Avanzamento', value: row => `${this.progressPercentage(row)}%` },
        { header: 'Invii in corso', value: row => row.inProgress },
        { header: 'Stato', value: row => row.error ? 'Errore' : row.complete ? 'Completata' : 'In corso' },
        { header: 'Messaggio errore', value: row => row.errorMessage }
      ]);
    } finally {
      this.exportingCsv = false;
    }
  }

  openSends(operation: OperationListItem): void {
    this.router.navigate(['/sends'], { queryParams: { operationId: operation.id, allDates: true } });
  }

  deleteOperation(operation: OperationListItem): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '470px', maxWidth: '92vw', panelClass: 'confirm-action-dialog',
      data: {
        eyebrow: 'ELIMINA OPERAZIONE',
        title: `Eliminare l’operazione #${operation.id}?`,
        message: `Saranno eliminati ${operation.recipients} invii, i relativi PosteCallClaims, i mittenti e l’operazione. L’azione è irreversibile.`,
        confirmLabel: 'Elimina operazione', confirmIcon: 'ri-folder-reduce-line'
      }
    });
    dialogRef.afterClosed().subscribe(confirm => {
      if (confirm) this.sendsService.deleteOperation(operation.id).subscribe({ next: () => this.load() });
    });
  }
}
