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
      password: ['', [Validators.required, Validators.minLength(6)]]
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
        if(this.id){
          this.usersService.getUserById(parseInt(this.id!))
            .subscribe((res: CompleteUser) => {     
              this.utente = res.user.businessName;
              if (this.linkedUser && !this.id2) {
                this.form.patchValue({ address: res.user.address });
              }
            });
        }
        if(this.id2){
          this.setForm();
        }
    });   
  }
  
  setForm() {
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.setValidators([Validators.minLength(6)]);
    this.form.get('password')?.updateValueAndValidity();
    this.usersService.getUserById(parseInt(this.id2!))
      .subscribe((res: CompleteUser) => {     
        this.form.patchValue({
          userTypes: res.user.userTypes.toString(),
          businessName: res.user.businessName,
          address: res.user.address,
          email: res.user.email,
          password: ''
        })
    });
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
