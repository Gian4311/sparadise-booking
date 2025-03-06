import { Link } from "react-router-dom";
import { PackageDataMap } from "../firebase/SpaRadiseTypes";
import PackageUtils from "../firebase/PackageUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";

interface PackageMenuPageData extends SpaRadisePageData {

    packageDataMap: PackageDataMap

}

export default function PackageMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< PackageMenuPageData >( {
            packageDataMap: {},
            updateMap: {}
        } ),
        { packageDataMap } = pageData
    ;

    async function loadPageData(): Promise< void > {

        pageData.packageDataMap = await PackageUtils.getPackageListAll();
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <Link to="/management/packages/new">
            <h1>New</h1>
        </Link>
        {

            packageDataMap ? Object.keys( packageDataMap ).map(
                ( packageId, index ) => <Link key={ index } to={ "/management/packages/" + packageId }>
                    <h1>{ packageId }</h1>
                </Link>
            ) : undefined

        }
    </>;

}
