import { Routes } from '@angular/router';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { NotFoundComponent } from './common/not-found/not-found.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthenticationComponent } from './authentication/authentication.component';
import { CrmComponent } from './dashboard/crm/crm.component';
import { UsersComponent } from './pages/users/users.component';
import { ReportComponent } from './pages/sends/report/report.component';
import { TotalReportComponent } from './pages/sends/total-report/total-report.component';
import { SendsComponent } from './pages/sends/sends/sends.component';
import { AddUserComponent } from './pages/users/add-user/add-user.component';

export const routes: Routes = [
    { path: '', redirectTo : '/dashboard', pathMatch: 'full' },
    {
        path: 'authentication',
        component: AuthenticationComponent,
        children: [
            {path: '', component: SignInComponent}
        ]
    },
    {
        path: 'dashboard', 
        component: CrmComponent,  
        canActivate: [AuthGuard]
    },
    {
        path: 'sends',
        component: SendsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'sends/report',
        component: ReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'sends/total-report',
        component: TotalReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'users/add',
        component: AddUserComponent,
        canActivate: [AuthGuard]
    },
    {
        path: '**', 
        component: NotFoundComponent,  
        canActivate: [AuthGuard]} 
];