import FormStringInput from "../components/FormStringInput";
import FormTextInput from "../components/FormTextInput";
import FormTinyTextInput from "../components/FormTinyTextInput";
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

    async function newEntityForm(): Promise< void > {

        pageData.serviceData = {
            name: null as unknown as string,
            description: null as unknown as string,
            serviceType: null as unknown as serviceType,
            roomType: null as unknown as roomType,
            ageLimit: null as unknown as number,
            durationMin: null as unknown as number
        }

    }

    async function openEntityForm(): Promise< void > {

        if( !documentId ) return;
        pageData.serviceData = await SpaRadiseFirestore.getServiceData( documentId );

    }

    function reloadPageData(): void {

        setPageData( pageData.shallowCopy() );

    }

    useEffect( () => { ( async() => {
        
        if( !documentId ) return;
        if( isNewMode )
            newEntityForm();
        else
            openEntityForm();
        reloadPageData();

    } )() }, [] );

    return <>
        <form>
            <h1>ID: { documentId }</h1>
            <label>Name</label>
            <FormStringInput keyName="name" object={ pageData.serviceData } reloader={ pageData }/>
            <label>Description</label>
            <FormTextInput keyName="description" object={ pageData.serviceData } reloader={ pageData }/>
        </form>
        <button onClick={ () => console.log( pageData ) }>Log page data</button>
    </>

}
