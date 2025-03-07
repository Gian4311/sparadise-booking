import { Link } from "react-router-dom";
import { JobDataMap } from "../firebase/SpaRadiseTypes";
import JobUtils from "../firebase/JobUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";

interface JobMenuPageData extends SpaRadisePageData {

    jobDataMap: JobDataMap

}

export default function JobMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< JobMenuPageData >( {
            jobDataMap: {},
            updateMap: {}
        } ),
        { jobDataMap } = pageData
    ;

    async function loadPageData(): Promise< void > {

        pageData.jobDataMap = await JobUtils.getJobListAll();
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <Link to="/management/jobs/new">
            <h1>New</h1>
        </Link>
        {

            jobDataMap ? Object.keys( jobDataMap ).map(
                ( jobId, index ) => <Link key={ index } to={ "/management/jobs/" + jobId }>
                    <h1>{ jobId }</h1>
                </Link>
            ) : undefined

        }
    </>;

}
