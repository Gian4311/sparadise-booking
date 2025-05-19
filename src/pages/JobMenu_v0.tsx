import { Link } from "react-router-dom";
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
        { jobDataMap } = pageData
        ;

    async function loadPageData(): Promise<void> {

        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <LoadingScreen loading={!pageData.loaded}></LoadingScreen>

        <div>
            <EmployeeSidebar pageData={ pageData } reloadPageData={ reloadPageData }/>
            <div className="service-menu-main-content">
                <label htmlFor="service-menu-main-content" className="service-menu-main-content-location">Jobs</label>
                <div className="service-menu-form-section">
                    <div className="controls">

                    </div>
                    <table className="services-table">
                        <thead><tr>
                            <th>#
                            </th><th>Job</th><th>Services</th></tr></thead>
                        <tbody>
                            
                        </tbody>
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
