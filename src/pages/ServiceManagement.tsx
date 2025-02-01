import SpaRadiseData from "../firebase/SpaRadiseData";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import {
    useEffect,
    useState
} from "react";
import { useParams } from "react-router-dom";

export default function ServiceManagement(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< SpaRadiseData >( new SpaRadiseData() ),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = ( documentId === "new" ),
        isEditMode: boolean = ( documentId !== undefined && !isNewMode )
    ;

    function reloadPageData(): void {

        setPageData( pageData.shallowCopy() );

    }

    useEffect( () => { ( async() => {
        
        if( !documentId ) return;
        if( isNewMode ) return;
        console.log( await SpaRadiseFirestore.getServiceData( documentId ) )
        reloadPageData();

    } )() }, [] );


    return <>
        <h1>ID: { documentId }</h1>
        <label>Name</label>
        
    </>

}
