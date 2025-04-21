import {
    ChangeEvent,
    useEffect,
    useState
} from "react";
import DateUtils from "../utils/DateUtils";
import {
    EmployeeDataMap,
    JobDataMap
} from "../firebase/SpaRadiseTypes";
import EmployeeUtils from "../firebase/EmployeeUtils";
import JobUtils from "../firebase/JobUtils";
import { Link, Outlet } from "react-router-dom";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import StringUtils from "../utils/StringUtils";
import { useNavigate } from "react-router-dom";
import "../styles/EmployeeServiceMenu.css";
import "../styles/Sidebar.css";
import SpaRadiseLogo from "../images/SpaRadise Logo.png";
import EmployeeSidebar from "../components/EmployeeSidebar";

import LoadingWrapper from "../components/LoadingWrapper";

type rowType = "employees";
type showMode = "active" | "all" | "inactive" | "onLeave";
type sortMode = "ascending" | "descending";

interface EmployeeMenuPageData extends SpaRadisePageData {

    employeeDataMap: EmployeeDataMap,
    jobDataMap: JobDataMap,
    rowTypeMap: { [documentId: documentId]: rowType }

}

export default function EmployeeMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeMenuPageData>({
            employeeDataMap: {},
            jobDataMap: {},
            loaded: false,
            updateMap: {},
            rowTypeMap: {}

        }),
        { employeeDataMap, jobDataMap, rowTypeMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [showMode, setShowMode] = useState<showMode>("all"),
        [sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
        ;

    function handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void {

        const { value } = event.target;
        setSearch(value);

    }

    async function loadPageData(): Promise<void> {

        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
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
        <LoadingWrapper loading={ !pageData.loaded }></LoadingWrapper>
        <div>
            <div className="layout"><EmployeeSidebar />
                <div className="content">
                    <Outlet />
                    <div className="service-menu-main-content">
                        <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Employees
                        </label>
                        <div className="service-menu-form-section">
                            <div className="service-stats">
                                <div className="service-stat">{ObjectUtils.keyLength(rowTypeMap)}<br></br><span>Employees</span></div>
                                <div className="service-stat">?<br></br><span>Active</span></div>
                                <div className="service-stat">?<br></br><span>On-Leave</span></div>
                                <div className="service-stat">?<br></br><span>Inactive</span></div>
                            </div>



                            {/* <Link to="/management/employees/new">
                <h1>New</h1>
            </Link>
            {

                employeeDataMap ? Object.keys(employeeDataMap).map((employeeId, index) => {

                    const employeeData = pageData.employeeDataMap[employeeId];
                    return <Link key={index} to={"/management/employees/" + employeeId}>
                        <h1>{PersonUtils.format( employeeData.firstName, employeeData.middleName, employeeData.lastName, "f mi l" )}</h1>
                    </Link>

                }) : undefined
            } */}
                            <div className="controls">
                                <input placeholder="Search employees" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                                <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                                    (sortMode === "ascending") ? "A - Z" : "Z - A"
                                }</button>
                                <Link to="/management/employees/new"><button className="action-btn" type="button">+ Add new employee</button></Link>
                            </div>
                            <table className="services-table">
                                <thead><tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Job</th>
                                    <th>Status</th>
                                    <th>Date Hired</th>
                                </tr></thead>
                                <tbody>{
                                    Object.keys(employeeDataMap).sort((documentId1, documentId2) => StringUtils.compare(
                                        PersonUtils.format(employeeDataMap[documentId1], "f mi l"),
                                        PersonUtils.format(employeeDataMap[documentId2], "f mi l"),
                                        (sortMode === "ascending")
                                    )).map((documentId, index) => {

                                        const
                                            count: string = (index + 1).toString(),
                                            { hireDate, job: { id: jobId } } = employeeDataMap[documentId],
                                            name: string = PersonUtils.format(employeeDataMap[documentId], "f mi l"),
                                            { name: jobName } = jobDataMap[jobId],
                                            hireDateText = DateUtils.toString(hireDate, "dd Mmmm yyyy"),
                                            show: boolean = (
                                                StringUtils.has(
                                                    `${count}\t${name}\t${jobName}\t${hireDateText}`
                                                    , search
                                                )
                                            )
                                            ;
                                        return show ? <tr key={documentId} onClick={() => navigate(`/management/employees/${documentId}`)}>
                                            <td>{count}</td>
                                            <td>{name}</td>
                                            <td>{jobName}</td>
                                            <td></td>
                                            <td>{hireDateText}</td>
                                        </tr> : undefined;

                                    })
                                }</tbody>
                            </table>
                            <button type="button" onClick={() => console.log(pageData)}>Log page date</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </>;

}
