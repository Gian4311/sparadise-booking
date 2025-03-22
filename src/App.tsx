import NewBooking from "./pages/NewBooking_v0";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DayPlannner from "./experiments/DayPlanner";
import DevMenu from "./pages/DevMenu";
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
import Homepage from "./pages/ClientIndex";

function App() {

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <DevMenu/> }/>
                <Route path="dayPlanner" element={ <DayPlannner/> }/>
                <Route path="clients/:accountId/account" element={ <MyAccount/> }/>
                <Route path="clients/:accountId/bookings/new" element={ <NewBooking/> }/>
                <Route path="management/employees/menu" element={ <EmployeeMenu/> }/>
                <Route path="management/employees/:id" element={ <EmployeeManagement/> }/>
                <Route path="management/employeeLeaves/menu" element={ <EmployeeLeaves/> }/>
                <Route path="management/employeeLeaves/menu/:employeeId" element={ <EmployeeLeaves/> }/>
                {/* <Route path="management/employeeLeaves/:id" element={ <EmployeeLeaveManagement/> }/> */}
                <Route path="management/jobs/menu" element={ <JobMenu/> }/>
                <Route path="management/jobs/:id" element={ <JobManagement/> }/>
                <Route path="management/packages/menu" element={ <PackageMenu/> }/>
                <Route path="management/packages/:id" element={ <PackageManagement/> }/>
                <Route path="management/servicesAndPackages/menu" element={ <ServicePackageMenu/> }/>
                <Route path="management/services/menu" element={ <ServiceMenu/> }/>
                <Route path="management/services/:id" element={ <ServiceManagement/> }/>
                <Route path="management/vouchers/menu" element={ <VoucherMenu/> }/>
                <Route path="management/vouchers/:id" element={ <VoucherManagement/> }/>
                <Route path="management/employees/menu" element={ <EmployeeMenu/> }/>
                
                
                <Route path="Homepage" element={ <Homepage/> }/>
            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
