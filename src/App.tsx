import NewBooking from "./pages/NewBooking_v0";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DayPlannner from "./experiments/DayPlanner";
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
import PackageMenu from "./pages/PackageMenu_v0";
import ServiceManagement from "./pages/ServiceManagement";
import ServiceMenu from "./pages/ServiceMenu_v0";
import ServicePackageMenu from "./pages/ServicePackageMenu_v0";
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
function App() {

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <Homepage/> }/>
                <Route path="/devMenu" element={ <DevMenu/> }/>
                <Route path="dayPlanner" element={ <DayPlannner/> }/>
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
                <Route path="management/packages/menu" element={ <PackageMenu/> }/>
                <Route path="management/packages/:id" element={ <PackageManagement/> }/>
                <Route path="management/servicesAndPackages/menu" element={ <ServicePackageMenu/> }/>
                <Route path="management/services/menu" element={ <ServiceMenu/> }/>
                <Route path="management/services/:id" element={ <ServiceManagement/> }/>
                <Route path="management/vouchers/menu" element={ <VoucherMenu/> }/>
                <Route path="management/vouchers/:id" element={ <VoucherManagement/> }/>
                <Route path="management/clients" element={ <ClientManagement/> }/>
                <Route path="management/clients/menu" element={<ClientMenu/>}/>
                <Route path="management/roomsAndChairs" element={ <RoomMaintenance/> }/>
                {/* <Route path="management/commissions/menu" element={ <CommissionMenu/> }/>
                <Route path="management/commissions" element={ <CommissionManagement/> }/> */}

                <Route path="newindex" element={ <NewHomepage/> }/>
                <Route path="notifications" element={ <Notifications/> }/>
                <Route path="bookingList" element={ <ClientBookingList/> }/>
                <Route path="clients/:accountId/account" element={ <MyAccount/> }/>
                <Route path="clients/:accountId/bookings/:bookingId" element={ <NewBooking/> }/>

            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
