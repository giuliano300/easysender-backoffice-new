import { Component, ViewChild } from '@angular/core';
import { CompleteUser } from '../../../interfaces/CompleteUser';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UsersService } from '../../../services/users.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ConfirmDialogComponent } from '../../../confirm-dialog/confirm-dialog.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    ReactiveFormsModule,
    MatInputModule,
    MatTooltipModule
  ],
  templateUrl: './children.component.html',
  styleUrl: './children.component.scss'
})
export class ChildrenComponent {

  displayedColumns: string[] = [];

  linkedUser = false;

  completeUser: CompleteUser[] = [];

  form: FormGroup;

  dataSource = new MatTableDataSource<CompleteUser>(this.completeUser);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFiltered: boolean = false;

  utente: string = "";

  id?: string = "";

  constructor(
      private dialog: MatDialog, 
      private router: Router,
      private fb: FormBuilder,
      private usersService: UsersService,
      private route: ActivatedRoute
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

    this.linkedUser = this.route.snapshot.data['linkedUser'] === true;
    this.displayedColumns = this.linkedUser
      ? ['businessName', 'email', 'address', 'enabled', 'edit', 'delete']
      : ['userTypes', 'businessName', 'email', 'address', 'enabled', 'edit', 'delete'];

    this.route.paramMap.subscribe(params => {
          this.id = params.get('id')!;
          if(this.id){
              this.getUsers();
              this.usersService.getUserById(parseInt(this.id!))
                .subscribe((res: CompleteUser) => {     
                  this.utente = res.user.businessName;
                });
          }
      });   

  }

  AddChildren(){
      this.router.navigate([this.linkedUser ? '/users/add-linked/' + this.id : '/users/add-children/' + this.id]);
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
    const request = this.linkedUser
      ? this.usersService.getLinkedUsers(parseInt(this.id!), filter)
      : this.usersService.getUsers(filter, parseInt(this.id!));

    request.subscribe({
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

  goToUsers() {
      this.router.navigate(['/users']);
  }

  UpdateItem(item:CompleteUser){
     const route = this.linkedUser ? "/users/edit-linked/" : "/users/edit-children/";
     this.router.navigate([route + this.id + "/" + item.user.id]);
  }

  isTruncated(element: HTMLElement): boolean {
    return element.offsetWidth < element.scrollWidth;
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
