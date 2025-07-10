import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sends } from '../../../interfaces/Sends';
import { SendsService } from '../../../services/sends.service';
import { UtilsService } from '../../../services/utils.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CurrentState, ProductTypes } from '../../../interfaces/enum';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CompleteUser } from '../../../interfaces/CompleteUser';
import { UsersService } from '../../../services/users.service';
import { Reports } from '../../../interfaces/Reports';

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
    MatSelectModule 
  ],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'it-IT' },
    { provide: MAT_DATE_FORMATS, useValue: IT_DATE_FORMATS }
  ]
})
export class ReportComponent {

  displayedColumns: string[] = ['userComplete', 'sends', 'ged', 'gedPoste', 'price'];

  reports: Reports[] = [];

  form: FormGroup;

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

  totaleInvii: number = 0;

  costoTotale: number = 0;

  dataSource = new MatTableDataSource<Reports>(this.reports);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFiltered: boolean = false;


  constructor(
      private dialog: MatDialog, 
      private router: Router,
      private fb: FormBuilder,
      private sendService: SendsService,
      public utils: UtilsService,
      private usersService: UsersService
  ) 
  {
    this.form = this.fb.group({
      start: [new Date()],
      end: [new Date()],
      sendType: [null],
      userId: [null]
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    const startRaw = this.form.value.start;
    const endRaw = this.form.value.end;

    const startDate = startRaw ? new Date(startRaw) : new Date();
    const endDate = endRaw ? new Date(endRaw) : new Date();

    let params = {
      startDate: startDate,
      endDate: endDate,
    };

    this.getReports(params);

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
      userId: userId,
      startDate: startDate,
      endDate: endDate,
      sendType: sendType,
      currentState: currentState
    };
    this.getReports(params);
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
      startDate: startDate,
      endDate: endDate,
    };

    this.getReports(params);

    this.isFiltered = false;
  }

  getReports(filter: any = "") {
    this.sendService.getReport(filter).subscribe({
      next: (data: Reports[]) => {
        this.reports = data;
        this.dataSource = new MatTableDataSource<Reports>(this.reports);
        this.dataSource.paginator = this.paginator;

        // Totali
        this.totaleInvii = this.reports.reduce((sum, r) => sum + r.sends, 0);
        this.costoTotale = this.reports.reduce((sum, r) => sum + r.price, 0);
      },
      error: (error) => {
        if (error.status === 404) {
          this.reports = [];
          this.dataSource = new MatTableDataSource<Reports>(this.reports);
          this.totaleInvii = 0;
          this.costoTotale = 0;
        }
      }
    });
  }

}
