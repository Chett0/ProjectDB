import { Component, Input, LOCALE_ID, OnInit,} from '@angular/core';
import { AirlineDashBoard } from '../../../../types/users/airlines';
import { Chart, ChartConfiguration, ChartData, ChartOptions, ChartType, registerables } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

import localeIt from '@angular/common/locales/it';
import { DecimalPipe, registerLocaleData } from '@angular/common';
registerLocaleData(localeIt); 
Chart.register(...registerables);


@Component({
  selector: 'app-airline-dashboard',
  imports: [DecimalPipe, BaseChartDirective],
  providers: [
    { provide: LOCALE_ID, useValue: 'it-IT' }  // <-- imposta italiano
  ],
  templateUrl: './airline-dashboard.component.html',
  styleUrl: './airline-dashboard.component.css'
})
export class AirlineDashboardComponent implements OnInit{
  
  @Input() dashboardStats!: AirlineDashBoard;

  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
      }
    },
    x: {
      title: {
        display: true,
        text: 'Routes'
      }
    }
  },
  plugins: {
    legend: {
      display: true
    },
    tooltip: {
      enabled: true
    }
  }
  };
  public barChartType: ChartType = 'bar';
  public barChartData: ChartData<'bar'> = {
    labels: [] as string[],
    datasets: [
      {
        label: 'Passenger Count',
        data: [] as number[],
        backgroundColor: '#3b82f6',
        borderRadius: 6
      }
    ]
  };

 public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Month Income (€)',
        fill: false,
        type: 'line',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      x: {
        offset: false,
        title: {
          display: true,
          text: 'Months'
        }
      },
      y: {
        title: {
          display: true,
        },
        beginAtZero: false,
        grace: '25%'
      }
    }
  };



ngOnInit() {
  console.log(this.dashboardStats);
  this.prepareRouteChart();
  this.prepareIncomeChart();
  }

  private prepareRouteChart() {
    this.barChartData.labels = this.dashboardStats.routesMostInDemand.map(r => `${r.departureAirportCode} ➔ ${r.arrivalAirportCode}`);
    this.barChartData.datasets[0].data = this.dashboardStats.routesMostInDemand.map(r => r.passengersCount);
  }

  private prepareIncomeChart() {
    this.lineChartData.labels = this.dashboardStats.monthlyIncomes.map(d => d.month);
    this.lineChartData.datasets[0].data = this.dashboardStats.monthlyIncomes.map(d => d.income);

  }
}
