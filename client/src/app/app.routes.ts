import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SearchFlightsComponent } from './components/flights/search-flights/search-flights.component';
import { AirlinesHomeComponent } from './components/airlines/airlines-home/airlines-home.component';
import { AirlinesDashboardComponent } from './components/airlines/airlines-home/airlines-dashboard/airlines-dashboard.component';
import { AircraftsComponent } from './components/airlines/aircrafts/aircrafts.component';
import { RoutesComponent } from './components/airlines/routes/routes.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';
// import { FlightsComponent } from './components/airlines/flights/flights.component';


export const routes: Routes = [
    {
        path:'',
        component:SearchFlightsComponent
    },
    {
        path: 'login',
        component : LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'admin',
        component: AdminHomeComponent
    },
    {
        path: 'airlines',
        component: AirlinesHomeComponent,
        children: [
            { path: '', pathMatch: 'full', component: AirlinesDashboardComponent },
            { path: 'aircrafts', component: AircraftsComponent },
            { path: 'routes', component : RoutesComponent }
            // { path: 'flights', component: FlightsComponent }
        ]
    }
    // {
    //     path: '**',
    //     // component:NotFound
    // }

];
