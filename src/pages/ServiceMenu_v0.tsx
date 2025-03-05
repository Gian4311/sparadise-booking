import { Link } from "react-router-dom";
import { ServiceDataMap } from "../firebase/SpaRadiseTypes";
import ServiceUtils from "../firebase/ServiceUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";

interface ServiceMenuPageData extends SpaRadisePageData  {

    serviceDataMap: ServiceDataMap

}

export default function ServiceMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< ServiceMenuPageData >( {
            serviceDataMap: {},
            updateMap: {}
        } ),
        { serviceDataMap } = pageData
    ;

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    useEffect( () => { ( async() => {

        pageData.serviceDataMap = await ServiceUtils.getServiceListAll();
        reloadPageData();

    } )() }, [] );

    useEffect( () => {

        console.log( pageData );

    }, [ pageData ] );

    return <>
        <Link to="/management/services/new">
            <h1>New</h1>
        </Link>
        {

            serviceDataMap ? Object.keys( serviceDataMap ).map(
                ( serviceId, index ) => <Link key={ index } to={ "/management/services/" + serviceId }>
                    <h1>{ serviceId }</h1>
                </Link>
            ) : undefined

        }
    </>;

}
