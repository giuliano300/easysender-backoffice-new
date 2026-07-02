import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
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
import { CompleteUser } from '../../../interfaces/CompleteUser';
import { UsersService } from '../../../services/users.service';
import { HistoricRecipientStatusDialogComponent } from '../../../dialogs/historic-recipient-status/historic-recipient-status-dialog.component';
import { RecipientService } from '../../../services/recipient.service';
import { GetDettaglioDestinatario } from '../../../interfaces/GetDettaglioDestinatario';
import { SendUpdateDialogComponent } from '../../../dialogs/send-update-dialog/send-update-dialog.component';
import { MatProgressBar } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin, Observable, tap } from 'rxjs';
import { StatusResponses } from '../../../interfaces/StatusResponses';

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

  displayedColumns: string[] = ['select', 'id', 'type', 'date', 'userComplete', 'sender', 'recipient', 'currentState', 'code', 'message', 'ctrl','det', 'edit', 'delete'];

  sends: Sends[] = [];

  form: FormGroup;

  firstLoading: boolean = false;

  pageIndex = 0;
  pageSize = 20;
  pageSizeOptions: number[] = [20, 50, 100, 200, 500];
  totalRecords: number = 0;

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

  date = new Date();
  daysToAdd = 1;
  newDate = new Date(this.date);

  selection = new SelectionModel<any>(true, []); // true = multiselect

  constructor(
      private dialog: MatDialog, 
      private router: Router,
      private fb: FormBuilder,
      private sendService: SendsService,
      public utils: UtilsService,
      private usersService: UsersService,      
      private recipientService: RecipientService
  ) 
  {
    this.newDate.setDate(this.newDate.getDate() + this.daysToAdd);

    this.form = this.fb.group({
      start: [new Date()],
      end: [new Date()],
      sendType: [null],
      currentState: [null],
      userId: [null],
      massiveAction: [null]
    });
  }
  

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    const startRaw = this.form.value.start;
    const endRaw = this.newDate;

    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date();

    const pageIndex = this.pageIndex;
    const pageSize = this.pageSize;

    let params = {
      pageIndex,
      pageSize,
      startDate: startDate,
      endDate: endDate,
    };

    this.getSends(params);

    this.getUsers();
  }


    getUsers() {
      this.usersService.getUsers("").subscribe({
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
    const userId = this.form.value.userId ?? '';
    const startRaw = this.form.value.start;
    const endRaw = this.form.value.end;
    const sendType = this.form.value.sendType ?? '';
    const currentState = this.form.value.currentState ?? '';

    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date();

    let params = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      userId: userId,
      startDate: startDate,
      endDate: endDate,
      sendType: sendType,
      currentState: currentState
    };
    this.getSends(params);
    this.isFiltered = true;
  }

  filterRemove(){
    this.form.patchValue({
      start: new Date(),
      end: new Date(),
      sendType: '',
      currentState: '',
      userId:  ''
    });
    const startRaw = this.form.value.start;
    const endRaw = this.form.value.end;

    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date();

    let params = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      startDate: startDate,
      endDate: endDate,
    };

    this.getSends(params);

    this.isFiltered = false;
  }

  getSends(filter: any = "") {
    this.firstLoading = true;
    this.selection.clear();
    this.sendService.getSends(filter).subscribe({
      next: (response: { data: Sends[]; totalCount: number }) => {

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
        //console.log(response.totalCount);
        this.firstLoading = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.sends = [];
          this.dataSource = new MatTableDataSource<Sends>(this.sends);
        }
        this.firstLoading = false;
      }
    });
  }


  onPaginateChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;

    const userId = this.form.value.userId ?? '';
    const startRaw = this.form.value.start;
    const endRaw = this.form.value.end;
    const sendType = this.form.value.sendType ?? '';
    const currentState = this.form.value.currentState ?? '';

    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date();

    let params = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      totalCounts: this.totalRecords,
      userId: userId,
      startDate: startDate,
      endDate: endDate,
      sendType: sendType,
      currentState: currentState
    };
    this.getSends(params);
  }
  
  UpdateItem(item:Sends){
     this.sendService.getSend(item.id).subscribe({
      next: (data: Sends) => {

        const dialogRef = this.dialog.open(SendUpdateDialogComponent, {
          data: data,
          width: '1000px',
          minWidth: '1000px'
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
      width: '500px'
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
        return 'row-success';
      case CurrentState.accettatoOnline:
      case CurrentState.documentoValidato:
        return 'row-info';
      default:
        return 'row-error';
    }
  }

  
  gotoDetails(send: Sends){
    this.sendService.getSend(send.id).subscribe({
      next: (data: Sends) => {

        const dialogRef = this.dialog.open(SendDialogComponent, {
          data: data,
          width: '1000px',
          minWidth: '1000px'
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
          width: '600px',
          minWidth: '600px'
        });
      }
    });

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
