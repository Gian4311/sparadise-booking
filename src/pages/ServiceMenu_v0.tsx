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
            loaded: false,
            serviceDataMap: {},
            updateMap: {}
        } ),
        { serviceDataMap } = pageData
    ;

    async function loadPageData(): Promise< void > {
    
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.loaded = true;
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <Link to="/management/services/new">
            <h1>New</h1>
        </Link>
        {
        
            serviceDataMap ? Object.keys( serviceDataMap ).map( ( serviceId, index ) => {
                
                const serviceData = pageData.serviceDataMap[ serviceId ];
                return <Link key={ index } to={ "/management/services/" + serviceId }>
                    <h1>{ serviceData.name }</h1>
                </Link>

            } ) : undefined

        }
    </>;

}
