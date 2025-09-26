import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SearchFlightsComponent } from './components/flights/search-flights/search-flights.component';
import { AirlinesHomeComponent } from './components/airlines/airlines-home/airlines-home.component';
import { AircraftsComponent } from './components/airlines/aircrafts/aircrafts.component';
import { RoutesComponent } from './components/airlines/routes/routes.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';

import { TicketBookingComponent } from './components/ticket-booking/ticket-booking.component';
import { adminGuard, authGuard, passengerGuard } from './guards/auth.guard';
import { PassengersComponent } from './components/passengers/passengers.component';
import { ListFlightsPageComponent } from './components/flights/list-flights-page/list-flights-page.component';


export const routes: Routes = [
    {
        path:'',
        redirectTo: 'search-flights',
        pathMatch: 'full'
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
        component: AdminHomeComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'airlines',
        component: AirlinesHomeComponent,
        children: [
            { path: 'aircrafts', component: AircraftsComponent },
            { path: 'routes', component : RoutesComponent }
            // { path: 'flights', component: FlightsComponent }
        ]
    },
    {
        path: 'passengers',
        component: PassengersComponent
    },
    {
        path: 'flights/buy-ticket',
        component: TicketBookingComponent,
        canActivate: [passengerGuard]
    },
    {
        path: 'search-flights',
        component: SearchFlightsComponent,
        children: [
            {
                path: 'flights',
                component: ListFlightsPageComponent
            }
        ]
    }

    // {
    //     path: '**','
    //     // component:NotFound
    // }

];
