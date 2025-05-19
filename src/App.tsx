import NewBooking from "./pages/NewBooking_v0";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CapacityMenu from "./pages/CapacityMenu";
import DevMenu from "./pages/DevMenu";
import EmployeeBookingManagement from "./pages/EmployeeBookingManagement";
import EmployeeBookingMenu from "./pages/EmployeeBookingMenu";
import EmployeeLeaveManagement from "./pages/EmployeeLeaveManagement_v0";
import EmployeeLeaves from "./pages/EmployeeLeaveMenu_v0 copy";
import EmployeeManagement from "./pages/EmployeeManagement_v0";
import EmployeeMenu from "./pages/EmployeeMenu_v0";
import JobManagement from "./pages/JobManagement_v0";
import JobMenu from "./pages/JobMenu_v0";
import MyAccount from "./pages/MyAccount_v0";
import PackageManagement from "./pages/PackageManagement_v0";
import PageNotFound from "./firebase/PageNotFound";
import ServiceManagement from "./pages/ServiceManagement";
import ServicePackageMenu from "./pages/ServicePackageMenu_v0";
import SpaRadiseAuth from "./firebase/SpaRadiseAuth";
import Unauthorized from "./firebase/Unauthorized";
import { useEffect, useState } from "react";
import VoucherManagement from "./pages/VoucherManagement_v0";
import VoucherMenu from "./pages/VoucherMenu_v0";

import Homepage from "./pages/NewClientIndex";
import Booking1 from "./pages/Booking1";
import ClientManagement from "./pages/EmployeeClientManagement";
import ClientMenu from "./pages/EmployeeClientMenu";
import ClientBookingList from "./pages/ClientBookingList";
import Notifications from "./pages/Notification";
import Dashboard from "./pages/EmployeeDashboard";
import RoomMaintenance from "./pages/RoomMaintenance";
import NewHomepage from "./pages/NewClientIndex";
import RoomMaintenanceManagement from "./pages/RoomManagement";
import { onAuthStateChanged } from "firebase/auth";
import CapacityManagement from "./pages/CapacityManagement";
function App() {

    const [ isManager, setIsManager ] = useState< boolean >();

    useEffect( () => {

        onAuthStateChanged( SpaRadiseAuth.getAuth(), async() => {

            const isManager = await SpaRadiseAuth.isManager()
            setIsManager( isManager );

        } );

    }, [] );

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <NewHomepage/> }/>
                <Route path="*" element={<PageNotFound/>} />
                <Route path="notifications" element={ <Notifications/> }/>
                <Route path="bookingList" element={ <ClientBookingList/> }/>
                <Route path="clients/:accountId/account" element={ <MyAccount/> }/>
                <Route path="clients/:accountId/bookings/:bookingId" element={ <NewBooking/> }/>

                {/* <Route path="/devMenu" element={ <DevMenu/> }/> */}

                {
                    isManager ? <>
                        <Route path="management/dashboard" element={ <Dashboard/> }/>
                        <Route path="management/bookings/menu" element={ <EmployeeBookingMenu/> }/>
                        <Route path="management/bookings/menu/:date" element={ <EmployeeBookingMenu/> }/>
                        <Route path="management/bookings/:id" element={ <EmployeeBookingManagement/> }/>
                        <Route path="management/employees/menu" element={ <EmployeeMenu/> }/>
                        <Route path="management/employees/:id" element={ <EmployeeManagement/> }/>
                        <Route path="management/employeeLeaves/menu" element={ <EmployeeLeaves/> }/>
                        <Route path="management/employeeLeaves/menu/:employeeId" element={ <EmployeeLeaves/> }/>
                        <Route path="management/employeeLeaves/:id" element={ <EmployeeLeaveManagement/> }/>
                        <Route path="management/jobs/menu" element={ <JobMenu/> }/>
                        <Route path="management/jobs/:id" element={ <JobManagement/> }/>
                        <Route path="management/packages/:id" element={ <PackageManagement/> }/>
                        <Route path="management/servicesAndPackages/menu" element={ <ServicePackageMenu/> }/>
                        <Route path="management/services/:id" element={ <ServiceManagement/> }/>
                        <Route path="management/vouchers/menu" element={ <VoucherMenu/> }/>
                        <Route path="management/vouchers/:id" element={ <VoucherManagement/> }/>
                        <Route path="management/clients" element={ <ClientManagement/> }/>
                        <Route path="management/clients/menu" element={<ClientMenu/>}/>
                        <Route path="management/roomsAndChairs" element={ <RoomMaintenance/> }/>
                        <Route path="management/capacities/menu" element={ <CapacityMenu/> }/>
                        <Route path="management/capacities/:id" element={ <CapacityManagement/> }/>
                        {/* <Route path="management/roomsAndChairs" element={ <RoomMaintenance/> }/> */}
                    </> : <Route path="management/*" element={ <Unauthorized/> }/>
                }
            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
