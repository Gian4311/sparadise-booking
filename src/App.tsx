import BookingCreation from "./pages/BookingCreation";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DayPlannner from "./experiments/DayPlanner";
import DevMenu from "./pages/DevMenu";
import JobManagement from "./pages/JobManagement";
import JobMenu from "./pages/JobMenu_v0";
import MyAccount from "./pages/MyAccount";
import PackageManagement from "./pages/PackageManagement_v0";
import PackageMenu from "./pages/PackageMenu_v0";
import ServiceManagement from "./pages/ServiceManagement";
import ServiceMenu from "./pages/ServiceMenu_v0";
import VoucherManagement from "./pages/VoucherManagement_v0";
import VoucherMenu from "./pages/VoucherMenu_v0";

function App() {

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <DevMenu/> }/>
                <Route path="dayPlanner" element={ <DayPlannner/> }/>
                <Route path="clients/:accountId/account" element={ <MyAccount/> }/>
                <Route path="clients/:accountId/bookings/new" element={ <BookingCreation/> }/>
                <Route path="management/jobs/menu" element={ <JobMenu/> }/>
                <Route path="management/jobs/:id" element={ <JobManagement/> }/>
                <Route path="management/packages/menu" element={ <PackageMenu/> }/>
                <Route path="management/packages/:id" element={ <PackageManagement/> }/>
                <Route path="management/services/menu" element={ <ServiceMenu/> }/>
                <Route path="management/services/:id" element={ <ServiceManagement/> }/>
                <Route path="management/vouchers/menu" element={ <VoucherMenu/> }/>
                <Route path="management/vouchers/:id" element={ <VoucherManagement/> }/>
            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
