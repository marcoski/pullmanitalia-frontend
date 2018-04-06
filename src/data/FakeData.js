import Avatars from "./_avatars";
import Bookings from "./_bookings";
import Configs from "./_configs";
import Customers from "./_customers";
import Invoices from "./_invoices";
import MainNav from "./_main-nav";
import Pullmans from "./_pullmans";
import Rentals from "./_rentals";
import Routes from "./_routes";
import Suppliers from "./_suppliers";
import UserAdmin from "./_user-admin";

import _ from "lodash";

export default class FakeData{
    construct(){
        this.db = {
            'Avatars': Avatars,
            'Bookings': Bookings,
            'Configs': Configs,
            'Customers': Customers,
            'Invoices': Invoices,
            'MainNav': MainNav,
            'Pullmans': Pullmans,
            'Rentals': Rentals,
            'Routes': Routes,
            'Suppliers': Suppliers,
            'UserAdmin': UserAdmin
        }

        this.timeout = 3000;
    }

    getPullmansFromSupplier(id){
        return new Promise((resolve) => {
            pullmans = _.filter(this.db.Pullmans.items, (p) => {return p.supplier == id} );
            setTimeout(
                () => resolve(pullmans),
                this.timeout
            );
        });
    }


}