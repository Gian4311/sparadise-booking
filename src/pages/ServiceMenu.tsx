import { Link } from "react-router-dom";
import SpaRadiseData from "../firebase/SpaRadiseData";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import {
    useEffect,
    useState
} from "react";

export default function ServiceMenu(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< SpaRadiseData >( new SpaRadiseData() ),
        { serviceDataMap } = pageData
    ;

    function reloadPageData(): void {

        setPageData( pageData.shallowCopy() );

    }

    useEffect( () => { ( async() => {

        pageData.serviceDataMap = await SpaRadiseFirestore.getServiceListAll();
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
                ( serviceId, index ) => <Link to={ "/management/services/" + serviceId }>
                    <h1 key={ index }>{ serviceId }</h1>
                </Link>
            ) : undefined
        }
    </>;

}
