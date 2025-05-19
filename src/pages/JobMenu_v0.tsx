import { AccountData, JobDataMap } from "../firebase/SpaRadiseTypes";
import JobUtils from "../firebase/JobUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";
import EmployeeSidebar from "../components/EmployeeSidebar";
import "../styles/EmployeeServiceMenu.css";
import LoadingScreen from "../components/LoadingScreen";
import { Link, useNavigate } from "react-router-dom";
import { ChangeEvent } from "react";
import StringUtils from "../utils/StringUtils";
import ObjectUtils from "../utils/ObjectUtils";

type sortMode = "ascending" | "descending";

interface JobMenuPageData extends SpaRadisePageData {

    accountData: AccountData,
    accountId?: documentId,
    jobDataMap: JobDataMap

}

export default function JobMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<JobMenuPageData>({
            accountData: {} as unknown as AccountData,
            jobDataMap: {},
            loaded: false,
            updateMap: {}
        }),
        { jobDataMap } = pageData,
        [search, setSearch] = useState<string>(""),
        [sortMode, setSortMode] = useState<sortMode>("ascending"),
        navigate = useNavigate()
    ;

    async function loadPageData(): Promise<void> {

        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function handleChangeSearch(event: ChangeEvent<HTMLInputElement>): void {
    
        const { value } = event.target;
        setSearch(value);

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
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Jobs</label>
                <div className="service-menu-form-section">
                    <div className="service-stats">
                        <div className="service-stat">{ObjectUtils.keyLength( jobDataMap )}<br></br><span>Services & Packages</span></div>
                    </div>
                    <div className="controls">
                        <input placeholder="Search services or packages" className="search" value={search} onChange={event => handleChangeSearch(event)} />
                        <button className="filter-btn" type="button" value={sortMode} onClick={toggleSortMode}>{
                            (sortMode === "ascending") ? "A - Z" : "Z - A"
                        }</button>
                        <Link to="/management/jobs/new"><button className="action-btn" type="button">+ Add new</button></Link>
                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#</th>
                            <th>Job</th>
                        </tr></thead>
                        <tbody>{
                            Object.keys( jobDataMap ).sort((documentId1, documentId2) => StringUtils.compare(
                                jobDataMap[documentId1].name,
                                jobDataMap[documentId2].name,
                                (sortMode === "ascending")
                            )).map((documentId, index) => {

                                const
                                    count: string = (index + 1).toString(),
                                    { name } = jobDataMap[documentId],
                                    show: boolean = StringUtils.has(
                                        `${count}\t${name}`
                                        , search
                                    )
                                ;
                                return show ? <tr key={documentId} onClick={() => navigate(`/management/jobs/${documentId}`)}>
                                    <td>{count}</td>
                                    <td>{name}</td>
                                </tr> : undefined;

                            })
                        }</tbody>
                    </table>
                </div>
            </div>
        </div>
        <Link to="/management/jobs/new">
            <h1>New</h1>
        </Link>
        {

            jobDataMap ? Object.keys(jobDataMap).map((jobId, index) => {

                const jobData = pageData.jobDataMap[jobId];
                return <Link key={index} to={"/management/jobs/" + jobId}>
                    <h1>{jobData.name}</h1>
                </Link>

            }) : undefined

        }
    </>;

}
