import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { DashboardService } from '../../services/dashboard.service';
import { Router } from '@angular/router';
import { GetDashboardStats } from '../../interfaces/GetDashboardStats';
@Component({
    selector: 'app-crm',
    imports: [MatCardModule],
    templateUrl: './crm.component.html',
    styleUrl: './crm.component.scss'
})
export class CrmComponent {
    constructor(
        private router: Router,
        private dashboardService: DashboardService
    ) {}

  g: GetDashboardStats | null = null;

  intervalId: any;

  ngOnInit(): void {
    this.getDashboard(); // chiamata iniziale subito
    this.intervalId = setInterval(() => {
      this.getDashboard();
    }, 5000); // ogni 5 secondi
  }

  ngOnDestroy(): void {
    // Pulisci l'intervallo quando il componente viene distrutto
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getDashboard() {
    this.dashboardService.getDashboard().subscribe({
      next: (data: GetDashboardStats) => {
          this.g = data;
      },
      error: (error) => {
        if (error.status === 404) {
          console.log(error);
        }
      }
    });
  }

  goToErrorSends(errorPeriod: 'today' | 'week' | 'month' | 'previous-month'): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(today);
    const end = new Date(today);

    if (errorPeriod === 'week') start.setDate(start.getDate() - 6);
    if (errorPeriod === 'month') start.setDate(1);
    if (errorPeriod === 'previous-month') {
      start.setMonth(start.getMonth() - 1, 1);
      end.setDate(0);
    }

    this.router.navigate(['/sends'], {
      queryParams: {
        currentState: -1,
        errorPeriod,
        startDate: this.toQueryDate(start),
        endDate: this.toQueryDate(end)
      }
    });
  }

  private toQueryDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }



}
