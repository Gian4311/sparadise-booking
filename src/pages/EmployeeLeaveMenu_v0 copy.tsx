import DataMapUtils from "../firebase/SpaRadiseDataMapUtils";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import {
    EmployeeData,
    EmployeeDataMap,
    EmployeeLeaveData,
    EmployeeLeaveDataMap,
    ServiceData,
    ServiceMaintenanceData,
    ServiceMaintenanceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeUtils from "../firebase/EmployeeUtils";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormMoneyInput from "../components/FormMoneyInput";
import FormNaturalNumberInput from "../components/FormNaturalNumberInput";
import FormPercentageInput from "../components/FormPercentageInput";
import FormSelect from "../components/FormSelect";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import { Link } from "react-router-dom";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

import SideBar from "../components/EmployeeSidebar";

interface EmployeeLeaveMenuPageData extends SpaRadisePageData {

    employeeDataMap: EmployeeDataMap,
    employeeLeaveDataMap: EmployeeLeaveDataMap


}

export default function EmployeeLeaveMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeLeaveMenuPageData>({
            employeeDataMap: {},
            employeeLeaveDataMap: {},
            loaded: false,
            updateMap: {}
        }),
        employeeId: string | undefined = useParams().employeeId,
        { employeeDataMap, employeeLeaveDataMap } = pageData
        ;

    async function loadPageData(): Promise<void> {

        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.employeeLeaveDataMap = await EmployeeLeaveUtils.getEmployeeLeaveDataMapAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    useEffect(() => { loadPageData(); }, []);

    return <>

        <SideBar></SideBar>

            <Link to="/management/employeeLeaves">
                <h1>New</h1>
            </Link>
            <div className="service-menu-main-content">
                <div className="service-menu-form-section">
            Employee search to add later: {employeeId ?? "None"}
            {

                employeeLeaveDataMap ? Object.keys(employeeLeaveDataMap).map((employeeLeaveId, index) => {

                    const
                        {
                            employee: { id: employeeId },
                            dateTimeStart, dateTimeEnd, reason
                        } = employeeLeaveDataMap[employeeLeaveId]
                        ;
                    return <Link key={index} to={"/management/employeeLeaves/" + employeeLeaveId}>
                        <div>
                            {PersonUtils.toString(employeeDataMap[employeeId], "f mi l")}
                            {` | `}
                            {DateUtils.toString(dateTimeStart, "Mmmm dd, yyyy - hh:mm")}
                            {` | `}
                            {DateUtils.toString(dateTimeEnd, "Mmmm dd, yyyy - hh:mm")}
                            {` | `}
                            {reason}
                        </div>
                    </Link>
            }) : undefined

        }</div></div>
    </>;

}
