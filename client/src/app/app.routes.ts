import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SearchFlightsComponent } from './components/flights/search-flights/search-flights.component';
import { AirlinesHomeComponent } from './components/airlines/airlines-home/airlines-home.component';
import { AdminHomeComponent } from './components/admin/admin-home/admin-home.component';
import { TicketBookingComponent } from './components/booking/ticket-booking/ticket-booking.component';
import { adminGuard, airlineGuard, passengerGuard } from './core/guards/auth.guard';
import { PassengersComponent } from './components/passengers/passengers.component';
import { PassengersResolver } from './core/resolvers/passengers.resolver';
import { AirlinesResolver } from './core/resolvers/airlines.resolver';
import { AdminResolver } from './core/resolvers/admin.resolver';
import { ListFlightsPageComponent } from './components/flights/list-flights-page/list-flights-page.component';
import { NotFoundComponent } from './components/utils/not-found/not-found.component';
import { SeatsMapComponent } from './components/booking/seats-map/seats-map.component';
import { ExtraComponent } from './components/airlines/extra/extra.component';
import { ExtraBookingComponent } from './components/booking/extra-booking/extra-booking.component';


export const routes: Routes = [
    {
        path:'',
        redirectTo: 'search-flights',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'admin',
        component: AdminHomeComponent,
        canActivate: [adminGuard],
        resolve: { adminData: AdminResolver }
    },
    {
        path: 'airlines',
        component: AirlinesHomeComponent,
        canActivate: [airlineGuard],
        resolve: { airlineData: AirlinesResolver }
    },
    {
        path: 'passengers',
        component: PassengersComponent,
        canActivate: [passengerGuard],
        resolve: { passengerData: PassengersResolver}
    },
    {
        path: 'booking',
        component: TicketBookingComponent,
        canActivate: [passengerGuard]
    },
    {
        path: 'seats',
        component: SeatsMapComponent,
        canActivate: [passengerGuard]
    },
    {
        path: 'booking/extras',
        component: ExtraBookingComponent,
        canActivate: [passengerGuard]
    },
    {
        path: 'search-flights',
        component: SearchFlightsComponent,
        children: [
            {
                path: 'flights',
                component: ListFlightsPageComponent,
            }
        ]
    },
    {
      path: '**',
      component: NotFoundComponent
    }
];
