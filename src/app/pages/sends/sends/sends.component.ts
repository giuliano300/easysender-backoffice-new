import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sends } from '../../../interfaces/Sends';
import { SendsService } from '../../../services/sends.service';
import { UtilsService } from '../../../services/utils.service';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CurrentState, MassiveActions, MassiveActionsLabel, ProductTypes } from '../../../interfaces/enum';
import { SendDialogComponent } from '../../../dialogs/send-dialog/send-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CompleteUser } from '../../../interfaces/CompleteUser';
import { UsersService } from '../../../services/users.service';
import { HistoricRecipientStatusDialogComponent } from '../../../dialogs/historic-recipient-status/historic-recipient-status-dialog.component';
import { RecipientService } from '../../../services/recipient.service';
import { GetDettaglioDestinatario } from '../../../interfaces/GetDettaglioDestinatario';
import { SendUpdateDialogComponent } from '../../../dialogs/send-update-dialog/send-update-dialog.component';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SelectionModel } from '@angular/cdk/collections';
import { firstValueFrom, forkJoin, Observable, tap } from 'rxjs';
import { StatusResponses } from '../../../interfaces/StatusResponses';
import { CsvExportService } from '../../../services/csv-export.service';

export const IT_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  standalone: true,
  selector: 'app-sends',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatPaginatorModule,
    MatTableModule,
    MatCheckboxModule,
    FeathericonsModule,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule,
    CommonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressBar,
    MatProgressSpinnerModule
],
  templateUrl: './sends.component.html',
  styleUrl: './sends.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS }
  ]
})
export class SendsComponent {

  displayedColumns: string[] = ['select', 'id', 'type', 'date', 'sender', 'recipient', 'currentState', 'code', 'arScan', 'message', 'ctrl', 'edit', 'delete'];

  sends: Sends[] = [];

  form: FormGroup;

  firstLoading: boolean = false;

  pageIndex = 0;
  pageSize = 20;
  pageSizeOptions: number[] = [20, 50, 100, 200, 500];
  totalRecords: number = 0;
  arScansCount: number | null = 0;

  actions = Object.values(MassiveActions)
    .filter(v => typeof v === 'number')
    .map(v => ({
      id: v as MassiveActions,
      name: MassiveActionsLabel[v as MassiveActions]
    }));
  
  productTypeList = Object.entries(ProductTypes)
    .filter(([key, value]) => typeof value === 'number')
    .map(([key, value]) => ({
      id: value,
      name: key.toUpperCase()
  }));

  currentState: any = [
    {id: null, name : "Tutti gli stati"},
    {id: -1, name : "Tutti gli errori"},
    {id: 0, name : "In attesa"},
    {id: 1, name : "Presa in carico"},
    {id: 2, name : "In lavorazione"},
    {id: 9, name : "Accettato on line"},
    {id: 11, name : "Documento validato"},
    {id: 5, name : "Errore submit"},
    {id: 6, name : "Errore validazione"},
    {id: 7, name : "Errore confirm"},
    {id: 100, name : "Errore generico"},
    {id: 999, name : "Errore non gestito"}
  ];

  users: CompleteUser[] = [];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFiltered: boolean = false;
  exportingCsv = false;

  waitingThresholds = [
    { id: 10, name: 'Da almeno 10 minuti' },
    { id: 20, name: 'Da almeno 20 minuti' },
    { id: 30, name: 'Da almeno 30 minuti' },
    { id: 60, name: 'Da almeno 1 ora' },
    { id: 180, name: 'Da almeno 3 ore' },
    { id: 360, name: 'Da almeno 6 ore' },
    { id: 720, name: 'Da almeno 12 ore' },
    { id: 1440, name: 'Da almeno 24 ore' }
  ];

  intervalId: any;

  date = new Date();
  daysToAdd = 1;
  newDate = new Date(this.date);

  selection = new SelectionModel<any>(true, []); // true = multiselect

  constructor(
      private dialog: MatDialog, 
      private router: Router,
      private route: ActivatedRoute,
      private fb: FormBuilder,
      private sendService: SendsService,
      public utils: UtilsService,
      private usersService: UsersService,      
      private recipientService: RecipientService,
      private csvExport: CsvExportService
  ) 
  {
    this.newDate.setDate(this.newDate.getDate() + this.daysToAdd);

    this.form = this.fb.group({
      start: [new Date()],
      end: [new Date()],
      sendType: [null],
      currentState: [null],
      recipientName: [''],
      code: [''],
      codePresence: [null],
      waitingMinutes: [null],
      userId: [null],
      userSearch: [''],
      massiveAction: [null]
    });
  }
  

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    const requestedStateParam = this.route.snapshot.queryParamMap.get('currentState');
    const requestedState = requestedStateParam === null ? null : Number(requestedStateParam);
    if (requestedState !== null && Number.isInteger(requestedState) && this.currentState.some((state: any) => state.id === requestedState)) {
      this.form.patchValue({ currentState: requestedState });
      if (requestedState === -1) {
        const start = this.parseQueryDate(this.route.snapshot.queryParamMap.get('startDate'));
        const end = this.parseQueryDate(this.route.snapshot.queryParamMap.get('endDate'));
        if (start && end) {
          this.form.patchValue({ start, end });
        } else {
          this.applyDashboardErrorPeriod(this.route.snapshot.queryParamMap.get('errorPeriod'));
        }
      }
      this.isFiltered = true;
    }

    this.refreshSends();
    this.intervalId = setInterval(() => {
      this.refreshSends();
    }, 30000); 

    this.getUsers();
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  get filteredUsers(): CompleteUser[] {
    const search = String(this.form.get('userSearch')?.value ?? '').trim().toLocaleLowerCase('it-IT');
    if (!search) return this.users.slice(0, 50);

    return this.users
      .filter(item => item.user.businessName?.toLocaleLowerCase('it-IT').includes(search))
      .slice(0, 50);
  }

  selectUser(user: CompleteUser): void {
    this.form.patchValue({ userId: user.user.id, userSearch: user.user.businessName }, { emitEvent: false });
  }

  displayUser(user: CompleteUser | string | null): string {
    return typeof user === 'string' ? user : user?.user.businessName ?? '';
  }

  userOptionLabel(user: CompleteUser): string {
    if (user.user.parentId > 0) return `${user.user.businessName} · Sottoutenza`;
    if (user.user.accountOwnerId) return `${user.user.businessName} · Utenza collegata`;
    return user.user.businessName;
  }

  clearSelectedUser(): void {
    this.form.patchValue({ userId: null }, { emitEvent: false });
  }

  private buildCurrentFilters(includeTotalCounts = false): any {
    const currentStateValue = this.form.value.currentState;
    const currentState = currentStateValue === null || currentStateValue === ''
      ? undefined
      : Number(currentStateValue);

    return {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      ...(includeTotalCounts && { totalCounts: this.totalRecords }),
      userId: this.form.value.userId ?? undefined,
      startDate: this.form.value.start ? new Date(this.form.value.start) : undefined,
      endDate: this.form.value.end ? new Date(this.form.value.end) : undefined,
      sendType: this.form.value.sendType ?? undefined,
      currentState,
      recipientName: this.form.value.recipientName?.trim() || undefined,
      code: this.form.value.code?.trim() || undefined,
      noCod: this.form.value.codePresence ?? undefined,
      waitingMinutes: this.form.value.waitingMinutes ?? undefined
    };
  }

  private refreshSends(includeTotalCounts = false): void {
    this.getSends(this.buildCurrentFilters(includeTotalCounts));
  }

  private applyDashboardErrorPeriod(period: string | null): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    let start: Date | null = null;

    switch (period) {
      case 'today':
        start = new Date(today);
        break;
      case 'week':
        start = new Date(today);
        start.setDate(start.getDate() - 6);
        break;
      case 'month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'previous-month':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end.setDate(0);
        break;
      default:
        this.form.patchValue({ start: null, end: null });
        return;
    }

    this.form.patchValue({ start, end });
  }

  private parseQueryDate(value: string | null): Date | null {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null;
  }


    getUsers() {
      this.usersService.getUsers("", undefined, true).subscribe({
        next: (data: CompleteUser[]) => {
            this.users = data;
        },
        error: (error) => {
          if (error.status === 404) {
            console.log(error);
          }
        }
      });
    }
  
  

  getRecipientHtml(element: any): string {
    const name = "<span class='primary-color-span'>" + this.utils.capitalizeFirstLetter(element.namesComplete || '') + "</span>";
    const requestId = element.requestId ? `<br><strong>IdRichiesta:</strong> ${element.requestId}` : '';
    return `${name}${requestId}`;
  }

  getTooltipContent(content: Sends): string {
    const str = content.namesComplete + " - IdRichiesta : " + content.requestId; 
    return str.replace(/<br\s*\/?>/gi, '\n');
  }

  onSubmit(){
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.refreshSends();
    this.isFiltered = true;
  }

  filterRemove(){
    this.form.patchValue({
      start: new Date(),
      end: new Date(),
      sendType: '',
      currentState: '',
      recipientName: '',
      code: '',
      codePresence: null,
      waitingMinutes: null,
      userId:  '',
      userSearch: ''
    });
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.refreshSends();

    this.isFiltered = false;
  }

  async exportFilteredSends(): Promise<void> {
    if (this.exportingCsv) return;

    this.exportingCsv = true;
    try {
      const filters = { ...this.buildCurrentFilters(false), pageIndex: 0, pageSize: 500 };
      const firstPage = await firstValueFrom(this.sendService.getSends(filters));
      const rows = [...firstPage.data];

      for (let pageIndex = 1; rows.length < firstPage.totalCount; pageIndex++) {
        const page = await firstValueFrom(this.sendService.getSends({ ...filters, pageIndex }));
        if (!page.data.length) break;
        rows.push(...page.data);
      }

      this.csvExport.download('invii-filtrati', rows, [
        { header: 'ID', value: row => row.id },
        { header: 'Tipo', value: row => row.type },
        { header: 'Data invio', value: row => this.utils.getDateFormatted(row.insertDate) },
        { header: 'Utente', value: row => row.userComplete },
        { header: 'Mittente', value: row => row.senderComplete || row.sender },
        { header: 'Destinatario', value: row => row.recipient || row.namesComplete },
        { header: 'Stato corrente', value: row => row.currentState },
        { header: 'Codice spedizione', value: row => row.codice },
        { header: 'Scansione AR', value: row => row.hasArScan ? 'Sì' : 'No' },
        { header: 'Messaggio', value: row => row.stato || row.state }
      ]);
    } finally {
      this.exportingCsv = false;
    }
  }

  getSends(filter: any = "") {
    this.firstLoading = true;
    this.selection.clear();
    this.sendService.getSends(filter).subscribe({
      next: (response: { data: Sends[]; totalCount: number; arScansCount: number }) => {

          this.sends = response.data.map(c => ({
            ...c, 
            action: {
                ctrl: 'ri-restart-line',
                det: 'ri-menu-search-line',
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
          })
        )
        this.dataSource.data = this.sends;
        this.totalRecords = response.totalCount;
        this.arScansCount = response.arScansCount ?? 0;
        //console.log(response.totalCount);
        this.firstLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.sends = [];
          this.dataSource = new MatTableDataSource<Sends>(this.sends);
          this.arScansCount = 0;
        }
        this.firstLoading = false;
      }
    });
  }

  downloadArScan(send: Sends): void {
    if (!send.hasArScan || send.arScanLoading) {
      return;
    }

    send.arScanLoading = true;
    this.sendService.downloadArScan(send.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `AR-${send.codice || send.id}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      complete: () => send.arScanLoading = false,
      error: () => send.arScanLoading = false
    });
  }

  getWaitingDuration(waitingMinutes: number | null | undefined): string {
    const elapsedMinutes = Math.max(0, waitingMinutes ?? 0);
    const days = Math.floor(elapsedMinutes / 1440);
    const hours = Math.floor((elapsedMinutes % 1440) / 60);
    const minutes = elapsedMinutes % 60;

    if (days > 0) return `Da ${days}g ${hours}h`;
    if (hours > 0) return `Da ${hours}h ${minutes}m`;
    return `Da ${minutes} min`;
  }

  unlockPendingSend(send: Sends): void {
    if (send.unblocking || !send.canUnlock) return;

    send.unblocking = true;
    this.sendService.unlockPendingSend(send.id).subscribe({
      next: () => this.refreshSends(),
      error: error => {
        console.error('Errore durante lo sblocco della spedizione:', error);
        send.unblocking = false;
      }
    });
  }


  onPaginateChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    this.refreshSends(true);
  }
  
  UpdateItem(item:Sends){
     this.sendService.getSend(item.id).subscribe({
      next: (data: Sends) => {

        const dialogRef = this.dialog.open(SendUpdateDialogComponent, {
          data: data,
          width: '960px',
          maxWidth: '94vw',
          maxHeight: '92vh',
          panelClass: 'send-update-dialog'
        });
         // 👇 Quando il dialog viene chiuso
        dialogRef.afterClosed().subscribe(result => {
          if (result)
            this.onSubmit();
        });

      }
    });
  }


  DeleteItem(item:Sends){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '470px',
      maxWidth: '92vw',
      panelClass: 'confirm-action-dialog'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.sendService.deleteSend(item.id)
          .subscribe((data: boolean) => {
            if(data){
              this.getSends();
            }
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }

  getRowClass(row: Sends): string {
    switch (row.currentStateInt) {
      case CurrentState.inAttesa:
        return 'row-base';
      case CurrentState.presaInCarico:
      case CurrentState.inlavorazione:
        return 'row-processing';
      case CurrentState.accettatoOnline:
      case CurrentState.documentoValidato:
        return 'row-info';
      case CurrentState.erroreConfirm:
        return 'row-error-confirm';
      default:
        // Ogni stato non operativo viene trattato visivamente come anomalia,
        // anche se verranno aggiunti nuovi codici di errore in futuro.
        return 'row-error';
    }
  }

  
  gotoDetails(send: Sends){
    this.sendService.getSend(send.id).subscribe({
      next: (data: Sends) => {

        const dialogRef = this.dialog.open(SendDialogComponent, {
          data: data,
          width: '960px',
          maxWidth: '94vw',
          maxHeight: '92vh',
          panelClass: 'send-details-dialog'
        });
      }
    });

  }


  checkStatus(send: any){
    send.loading = true;
    var response = this.recipientService.statusRetrive(send).subscribe({
      next: (res) => {
        this.onSubmit();
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dello stato:", err);
      },
      complete: () => {
        send.loading = false; 
      }
    });
  }


  assignCode(send: any): Observable<StatusResponses> {
    return this.recipientService.AssignCode(send).pipe(
      tap((res: StatusResponses) => {
        send.stato = res.message;
        if(res.message === "Presa in carico Poste"){
          send.currentState = "In lavorazione";
          send.codice = "in aggiornamento";
          send.currentStateInt = CurrentState.inlavorazione;
          this.getRowClass(send);
        }
      })
    );
  }  
  
  saveAndSend(params: any): Observable<StatusResponses> {
    return this.recipientService.SaveAndSend(params).pipe(
      tap({
        next: (res) => {
          this.onSubmit();
        },
        error: (err) => {
          console.error("Errore durante il salvataggio e l'invio:", err);
        },
        complete: () => {
        }
      })
    );
  }

  getStati(send: Sends){
    this.recipientService.getDettaglioDestinatario(send.id).subscribe({
      next: (data: GetDettaglioDestinatario) => {

        const dialogRef = this.dialog.open(HistoricRecipientStatusDialogComponent, {
          data: data,
          width: '680px',
          maxWidth: '94vw',
          maxHeight: '90vh',
          panelClass: 'send-history-dialog'
        });
      }
    });

  }

  openSendFromRow(event: MouseEvent, send: Sends): void {
    const target = event.target as Element | null;
    if (target?.closest('button, input, a, .mat-mdc-checkbox, .cursor-pointer')) {
      return;
    }

    this.gotoDetails(send);
  }

  isTruncated(element: HTMLElement): boolean {
    return element.offsetWidth < element.scrollWidth;
  }

  assign(){
    const action = this.form.value.massiveAction;
    const selectedRows = this.selection.selected;
    if(action === null || action === undefined)
      return;

    this.firstLoading = true;

    //ASSEGNA CODICE MOL/COL
    if(action === MassiveActions.AssignCodeMOLCOL)
    {
      const requests = selectedRows.map(row => this.assignCode(row));

      forkJoin(requests).subscribe({
        next: () => {
          // tutte completate
          this.onSubmit();
          console.log("Assegnazione completata per tutte le righe selezionate.");
        },
        error: (err) => {
          console.error(err);
          this.firstLoading = false;
        },
        complete: () => {
          this.firstLoading = false;
        }
      });
    }

    //SALVA E SPEDISCI
    if(action === MassiveActions.SaveAndSend){
      let params = {
       ids: selectedRows.map((r: any) => r.id)
      };
      
      this.saveAndSend(params).subscribe({
        next: () => {
          this.onSubmit();
        },
        complete: () => {
          this.firstLoading = false;
        }
      });
    }
    
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
      this.isAllSelected()
          ? this.selection.clear()
          : this.dataSource.data.forEach(row => this.selection.select(row));
  }
}
