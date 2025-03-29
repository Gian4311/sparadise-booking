import { doc, getDoc } from "firebase/firestore/lite";
import { Firestore } from "firebase/firestore/lite";
import { Link } from "react-router-dom";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useEffect } from "react";

export default function DevMenu(): JSX.Element {

    useEffect( () => { ( async() => {

        // const firestore: Firestore = SpaRadiseFirestore.getFirestore();
        // const a = doc( firestore, "sample", "8GtJ031Dz7cfr5iR0Usa" );
        // const b = await getDoc( a );
        // console.log( b.data() );
        // console.log( await SpaRadiseFirestore.getServiceListAll() )

    } )() }, [] );

    return <>
        <Link to="dayPlanner"><button>Go to Day Planner experiment page</button></Link><br/>
        <Link to="management/employees/menu"><button>Employee Menu</button></Link><br/>
        <Link to="management/employeeLeaves/menu"><button>Employee Leaves Menu</button></Link><br/>
        <Link to="management/jobs/menu"><button>Job Menu</button></Link><br/>
        <Link to="management/packages/menu"><button>Package Menu</button></Link><br/>
        <Link to="clients/A6xoQYfymODeKJdp8bnT/account"><button>R-Man's Account</button></Link><br/>
        <Link to="clients/A6xoQYfymODeKJdp8bnT/bookings/new"><button>R-Man's New Booking</button></Link><br/>
        <Link to="management/services/menu"><button>Service Menu</button></Link><br/>
        <Link to="management/servicesAndPackages/menu"><button>Services & Packages</button></Link><br/>
        <Link to="management/vouchers/menu"><button>Voucher Menu</button></Link><br/>
        <Link to="Homepage"><button>Client Homepage</button></Link><br/>
    </>;

}
