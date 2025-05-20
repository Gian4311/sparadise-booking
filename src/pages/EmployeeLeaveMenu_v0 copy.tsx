import DataMapUtils from "../firebase/SpaRadiseDataMapUtils";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import {
    AccountData,
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
    ChangeEvent,
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
import EmployeeSidebar from "../components/EmployeeSidebar";
import LoadingScreen from "../components/LoadingScreen";
import StringUtils from "../utils/StringUtils";

type sortMode = "ascending" | "descending";

interface EmployeeLeaveMenuPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveDataMap: EmployeeLeaveDataMap


}

export default function EmployeeLeaveMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeLeaveMenuPageData>({
            accountData: {} as unknown as AccountData,
            employeeDataMap: {},
            employeeLeaveDataMap: {},
            loaded: false,
            updateMap: {}
        }),
        employeeId: string | undefined = useParams().employeeId,
        { employeeDataMap, employeeLeaveDataMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [ sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
    ;
    
    function handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void {
        
        const { value } = event.target;
        setSearch(value);

    }

    async function loadPageData(): Promise<void> {
        
        pageData.loaded = false;
        reloadPageData();
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.employeeLeaveDataMap = await EmployeeLeaveUtils.getEmployeeLeaveDataMapAll();
        console.log( pageData.employeeLeaveDataMap )
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    function toggleSortMode(): void {

        const newSortMode: sortMode = (sortMode === "ascending") ? "descending" : "ascending";
        setSortMode(newSortMode);

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <EmployeeSidebar pageData={ pageData } reloadPageData={ reloadPageData }/>
        <LoadingScreen loading={!pageData.loaded}></LoadingScreen>
        <div>
            
            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Leaves</label>
                <div className="service-menu-form-section">
                    <div className="service-stats">
                        <div className="service-stat">{ObjectUtils.keyLength( employeeLeaveDataMap )}<br></br><span>Total Leaves</span></div>
                    </div>
                    <div className="controls">
                        <input placeholder="Search employeeLeaves" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "New to Old" : "Old to New"
                        }</button>
                        <Link to="/management/employeeLeaves/new"><button className="action-btn" type="button">+ Add new</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Status</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Reason</th>
                        </tr></thead>
                        <tbody>{
                            Object.keys( employeeLeaveDataMap ).sort((documentId1, documentId2) => {
                            
                                const
                                    date1 = pageData.employeeLeaveDataMap[ documentId1 ].dateTimeStart,
                                    date2 = pageData.employeeLeaveDataMap[ documentId2 ].dateTimeStart
                                ;
                                if( !date1 ) return -1;
                                if( !date2 ) return 1;
                                return DateUtils.compare( date1, date2 );

                            }).map((documentId, index) => {

                                const
                                    count: string = (index + 1).toString(),
                                    { dateTimeEnd, dateTimeStart, reason, status } = employeeLeaveDataMap[documentId],
                                    startStr = DateUtils.toString( dateTimeStart, "Mmmm dd, yyyy - hh:mm a.m." ),
                                    endStr = DateUtils.toString( dateTimeEnd, "Mmmm dd, yyyy - hh:mm a.m." ),
                                    show: boolean = StringUtils.has(
                                        `${count}\t${startStr}\t${endStr}\t${reason}`
                                        , search
                                    )
                                ;
                                return show ? <tr key={documentId} onClick={() => navigate(`/management/employeeLeaves/${documentId}`)}>
                                    <td>{count}</td>
                                    <td>{ status === "approved" ? "Approved" : status === "canceled" ? "Canceled" : "Pending" }</td>
                                    <td>{ startStr }</td>
                                    <td>{ endStr }</td>
                                    <td>{ reason }</td>
                                </tr> : undefined;

                            })
                        }</tbody>
                    </table>
                </div>
            </div>
        </div>
    </>;

}
