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

@Component({
  standalone: true,
  selector: 'app-users',
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
    MatInputModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

  displayedColumns: string[] = ['businessName', 'vatNumber', 'email', 'address', 'usernamePoste', 'passwordPoste', 'enabled', 'edit', 'delete'];

  completeUser: CompleteUser[] = [];

  form: FormGroup;

  dataSource = new MatTableDataSource<CompleteUser>(this.completeUser);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFiltered: boolean = false;


  constructor(
      private dialog: MatDialog, 
      private router: Router,
      private fb: FormBuilder,
      private usersService: UsersService
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

    this.getUsers();

  }

  onSubmit(){
    const f = this.form.value.nominativo;
    this.getUsers(f);
    this.isFiltered = true;
  }

  filterRemove(){
    this.getUsers('');
    this.form.patchValue({
      nominativo: ''
    });
    this.isFiltered = false;
  }

  getUsers(filter: string = "") {
    this.usersService.getUsers(filter).subscribe({
      next: (data: CompleteUser[]) => {
          this.completeUser = data
          .sort((a, b) => b.user.id - a.user.id)
          .map(c => ({
            ...c, 
            action: {
                edit: 'ri-edit-line',
                delete: 'ri-delete-bin-line'
            }
          })
        )
        this.dataSource = new MatTableDataSource<CompleteUser>(this.completeUser);
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        if (error.status === 404) {
          this.completeUser = [];
          this.dataSource = new MatTableDataSource<CompleteUser>(this.completeUser);
        }
      }
    });
  }

  UpdateItem(item:CompleteUser){
     this.router.navigate(["/users/edit/" + item.user.id]);
  }


  DeleteItem(item:CompleteUser){

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.usersService.deleteUser(item.user.id)
          .subscribe((data: any) => {
            this.getUsers();
          });
      } 
      else 
      {
        console.log("Close");
      }
    });
  }


}
