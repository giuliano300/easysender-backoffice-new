import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FeathericonsModule } from '../../../icons/feathericons/feathericons.module';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { CompleteUser } from '../../../interfaces/CompleteUser';
import { Child } from '../../../interfaces/Child';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-add-children',
  imports: [MatCardModule, MatInputModule, MatFormFieldModule, MatSelectModule, FeathericonsModule, ReactiveFormsModule],
  templateUrl: './add-children.component.html',
  styleUrl: './add-children.component.scss'
})
export class AddChildrenComponent {
  hide = true;
  
  id?: string = "";
  
  id2?: string = "";

  utente: string = "";

  linkedUser = false;

  form: FormGroup;

  constructor(
      private router: Router,
      private fb: FormBuilder,
      private usersService: UsersService,
      private route: ActivatedRoute
  ) 
  {
    this.form = this.fb.group({
      userTypes: ['', Validators.required],
      businessName: ['', Validators.required],
      address: [''],
      email: ['', [Validators.email, Validators.required]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      usernameOldSite: ['', Validators.email],
      passwordOldSite: ['']
    });
  }

  ngOnInit(): void {
    this.linkedUser = this.route.snapshot.data['linkedUser'] === true;
    if (this.linkedUser) {
      this.form.patchValue({ userTypes: '1' });
    }
    this.route.paramMap.subscribe(params => {
        this.id = params.get('id')!;
        this.id2 = params.get('id2')!;
        if (this.id && this.id2) {
          this.setForm();
        }
        else if(this.id){
          this.usersService.getUserById(parseInt(this.id!))
            .subscribe((res: CompleteUser) => {     
              this.utente = res.user.businessName;
              if (this.linkedUser && !this.id2) {
                this.form.patchValue({ address: res.user.address });
              }
            });
        }
    });   
  }
  
  setForm() {
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.setValidators([Validators.minLength(3)]);
    this.form.get('password')?.updateValueAndValidity();
    forkJoin({
      parent: this.usersService.getUserById(parseInt(this.id!)),
      child: this.usersService.getUserById(parseInt(this.id2!))
    }).subscribe(({ parent, child }) => {
        this.utente = parent.user.businessName;
        this.form.patchValue({
          userTypes: child.user.userTypes.toString(),
          businessName: child.user.businessName,
          address: child.user.address,
          email: child.user.email,
          password: this.getVisiblePassword(
            child.user.password,
            child.user.passwordOldSite ?? parent.user.passwordOldSite
          ),
          usernameOldSite: child.user.usernameOldSite ?? parent.user.usernameOldSite ?? '',
          passwordOldSite: child.user.passwordOldSite ?? parent.user.passwordOldSite ?? ''
        });
    });
  }

  private getVisiblePassword(password?: string, oldSitePassword?: string): string {
    const value = password?.trim() ?? '';
    const isPbkdf2Hash = value.length === 44 && /^[A-Za-z0-9+/]{43}=$/.test(value);

    return isPbkdf2Hash || !value
      ? oldSitePassword ?? ''
      : value;
  }
  
  goToUser() {
      this.router.navigate([this.linkedUser ? '/users/linked/' + this.id : '/users/children/' + this.id]);
  }
  
  goToUsers() {
      this.router.navigate(['/users']);
  }

  saveUser(){
      if (this.form.valid) 
      {
        const child: Child = this.form.value;
        child.parentId = parseInt(this.id!);
        if(this.id2){
          child.id = parseInt(this.id2);
          const request = this.linkedUser
            ? this.usersService.updateLinkedUser(child)
            : this.usersService.updateChildren(child);
          request
            .subscribe((res: number) => {     
              this.goToUser();
            });
        }
        else {
          const request = this.linkedUser
            ? this.usersService.setLinkedUser(child)
            : this.usersService.setChildren(child);
          request
            .subscribe((res: number) => {     
              this.goToUser();
            });
        }
      }
  }
}
