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
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CurrentState, ProductTypes } from '../../../interfaces/enum';
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
import { fakeAsync } from '@angular/core/testing';

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
    MatProgressBar
],
  templateUrl: './sends.component.html',
  styleUrl: './sends.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS }
  ]
})
export class SendsComponent {

  displayedColumns: string[] = ['id', 'type', 'date', 'userComplete', 'sender', 'recipient', 'currentState', 'code', 'message', 'ctrl','det', 'edit', 'delete'];

  sends: Sends[] = [];

  form: FormGroup;

  firstLoading: boolean = false;

  pageIndex = 0;
  pageSize = 20;
  totalRecords: number = 0;

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
  ];

  users: CompleteUser[] = [];

  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFiltered: boolean = false;

  date = new Date();
  daysToAdd = 1;
  newDate = new Date(this.date);

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
      userId: [null]
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

    let params = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
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
    this.sendService.getSends(filter).subscribe({
      next: (response: { data: Sends[]; totalCount: number }) => {

          this.sends = response.data.map(c => ({
            ...c, 
            action: {
                ctrl: 'ri-mail-check-line',
                det: 'ri-menu-search-line',
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
          })
        )
        this.dataSource.data = this.sends;
        this.totalRecords = response.totalCount;
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
    const userId = this.form.value.userId ?? '';
    const startRaw = this.form.value.start;
    const endRaw = this.form.value.end;
    const sendType = this.form.value.sendType ?? '';
    const currentState = this.form.value.currentState ?? '';

    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date();

    let params = {
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
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


  checkStatus(send: Sends){

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

}
