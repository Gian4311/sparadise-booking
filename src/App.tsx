import { BrowserRouter, Routes, Route } from "react-router-dom";
import DayPlannner from "./experiments/DayPlanner";
import DevMenu from "./pages/DevMenu";
import ServiceManagement from "./pages/ServiceManagement";
import ServiceMenu from "./pages/ServiceMenu";

function App() {

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <DevMenu/> }/>
                <Route path="dayPlanner" element={ <DayPlannner/> }/>
                <Route path="management/services/menu" element={ <ServiceMenu/> }/>
                <Route path="management/services/:id" element={ <ServiceManagement/> }/>
            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
