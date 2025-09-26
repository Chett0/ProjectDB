import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SearchFlightsComponent } from './components/flights/search-flights/search-flights.component';
import { AirlinesHomeComponent } from './components/airlines/airlines-home/airlines-home.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';
import { TicketBookingComponent } from './components/ticket-booking/ticket-booking.component';
import { adminGuard, authGuard, airlineGuard, passengerGuard } from './guards/auth.guard';
import { PassengersComponent } from './components/passengers/passengers.component';


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
        component: AdminHomeComponent,
        canActivate: [adminGuard]
    },
    {
        path: 'airlines',
        component: AirlinesHomeComponent,
        canActivate: [airlineGuard]
    },
    {
        path: 'passengers',
        component: PassengersComponent,
        canActivate: [passengerGuard]
    },{
        path: 'flights/buy-ticket',
        component: TicketBookingComponent,
        // canActivate: [authGuard]
    }
    // {
    //     path: '**','
    //     // component:NotFound
    // }

];
