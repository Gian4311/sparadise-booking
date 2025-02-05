import { BrowserRouter, Routes, Route } from "react-router-dom";
import DayPlannner from "./experiments/DayPlanner";
import DevMenu from "./pages/DevMenu";
// import VoucherMangement from ".pages/VoucherMangement";

function App() {

    return <>
        <BrowserRouter>
            <Routes>
                <Route index element={ <DevMenu/> }/>
                <Route path="dayPlanner" element={ <DayPlannner/> }/>
            </Routes>
        </BrowserRouter>
    </>;
}

export default App;
