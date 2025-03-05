import { BrowserRouter, Routes, Route } from "react-router-dom";
import DayPlannner from "./experiments/DayPlanner";
import DevMenu from "./pages/DevMenu";
import PackageManagement from "./pages/PackageManagement_v0";
import PackageMenu from "./pages/PackageMenu_v0";
import ServiceManagement from "./pages/ServiceManagement";
import ServiceMenu from "./pages/ServiceMenu_v0";

function App() {

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <DevMenu/> }/>
                <Route path="dayPlanner" element={ <DayPlannner/> }/>
                <Route path="management/packages/menu" element={ <PackageMenu/> }/>
                <Route path="management/packages/:id" element={ <PackageManagement/> }/>
                <Route path="management/services/menu" element={ <ServiceMenu/> }/>
                <Route path="management/services/:id" element={ <ServiceManagement/> }/>
            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
