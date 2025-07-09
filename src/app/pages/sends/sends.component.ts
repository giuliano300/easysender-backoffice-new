import { Component, ViewChild } from '@angular/core';
import { CompleteUser } from '../../interfaces/CompleteUser';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../../services/users.service';
import { Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeathericonsModule } from '../../icons/feathericons/feathericons.module';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Sends } from '../../interfaces/Sends';
import { SendsService } from '../../services/sends.service';
import { UtilsService } from '../../services/utils.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CurrentState } from '../../interfaces/enum';

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
    CommonModule
  ],
  templateUrl: './sends.component.html',
  styleUrl: './sends.component.scss'
})
export class SendsComponent {

  displayedColumns: string[] = ['id', 'type', 'date', 'userComplete', 'sender', 'recipient', 'currentState', 'code', 'message', 'edit', 'delete'];

  sends: Sends[] = [];

  form: FormGroup;

  dataSource = new MatTableDataSource<Sends>(this.sends);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFiltered: boolean = false;


  constructor(
      private dialog: MatDialog, 
      private router: Router,
      private fb: FormBuilder,
      private sendService: SendsService,
      public utils: UtilsService
  ) 
  {
    this.form = this.fb.group({
      nominativo: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('authToken');
    if (!token) 
      this.router.navigate(['/']);

    this.getSends();

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
    const f = this.form.value.nominativo;
    this.getSends(f);
    this.isFiltered = true;
  }

  filterRemove(){
    this.getSends('');
    this.form.patchValue({
      nominativo: ''
    });
    this.isFiltered = false;
  }

  getSends(filter: string = "") {
    this.sendService.getSends().subscribe({
      next: (data: Sends[]) => {
          this.sends = data.map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
          })
        )
        this.dataSource = new MatTableDataSource<Sends>(this.sends);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        if (error.status === 404) {
          this.sends = [];
          this.dataSource = new MatTableDataSource<Sends>(this.sends);
        }
      }
    });
  }

  UpdateItem(item:Sends){
     this.router.navigate(["/sends/edit/" + item.id]);
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

}
