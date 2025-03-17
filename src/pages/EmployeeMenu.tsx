import { Link } from "react-router-dom";
import { EmployeeDataMap } from "../firebase/SpaRadiseTypes";
import EmployeeUtils from "../firebase/EmployeeUtils";
import PersonUtils from "../utils/PersonUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";

interface EmployeeMenuPageData extends SpaRadisePageData {

    employeeDataMap: EmployeeDataMap

}

export default function EmployeeMenu(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeMenuPageData>({
            loaded: false,
            employeeDataMap: {},
            updateMap: {}
        }),
        { employeeDataMap } = pageData
        ;

    async function loadPageData(): Promise<void> {

        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <Link to="/management/employees/new">
            <h1>New</h1>
        </Link>
        {

            employeeDataMap ? Object.keys(employeeDataMap).map((employeeId, index) => {

                const employeeData = pageData.employeeDataMap[employeeId];
                return <Link key={index} to={"/management/employees/" + employeeId}>
                    <h1>{PersonUtils.format( employeeData.firstName, employeeData.middleName, employeeData.lastName, "f mi l" )}</h1>
                </Link>

            }) : undefined
        }
    </>;

}
