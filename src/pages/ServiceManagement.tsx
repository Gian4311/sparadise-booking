import DataMapUtils from "../utils/DataMapUtils";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormMoneyInput from "../components/FormMoneyInput";
import FormNaturalNumberInput from "../components/FormNaturalNumberInput";
import FormPercentageInput from "../components/FormPercentageInput";
import FormSelect from "../components/FormSelect";
import FormStringInput from "../components/FormStringInput";
import FormTextInput from "../components/FormTextInput";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import {
    ServiceData,
    ServiceMaintenanceData,
    ServiceMaintenanceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

interface ServiceMangementPageData extends SpaRadisePageData {
    
    serviceDefaultData: ServiceData,
    serviceData: ServiceData,
    serviceDocumentReference?: DocumentReference,
    serviceMaintenanceDefaultDataMap: ServiceMaintenanceDataMap,
    serviceMaintenanceDataMap: ServiceMaintenanceDataMap,
    serviceMaintenanceDateKeyMap: { [ yyyymmdd: string ]: documentId | number },
    serviceMaintenanceIndex: number,
    serviceMaintenanceToDeleteMap: { [ serviceMaintenanceId: string ]: boolean }

}

export default function ServiceManagement(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< ServiceMangementPageData >( {
            serviceData: undefined as unknown as ServiceData,
            serviceDefaultData: {} as ServiceData,
            serviceMaintenanceDataMap: {},
            serviceMaintenanceDefaultDataMap: {},
            serviceMaintenanceDateKeyMap: {},
            serviceMaintenanceIndex: 0,
            serviceMaintenanceToDeleteMap: {},
            updateMap: {}
        } ),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = ( documentId === "new" ),
        isEditMode: boolean = ( documentId !== undefined && !isNewMode )
    ;

    async function addServiceMaintenanceRow(): Promise< void > {

        const {
            serviceMaintenanceDateKeyMap,
            serviceMaintenanceToDeleteMap
        } = pageData;
        let
            date: Date = new Date(),
            dateKey: string = getDateKey( date ),
            inDeleteMap: boolean = ( dateKey in serviceMaintenanceToDeleteMap )
        ;
        while( dateKey in pageData.serviceMaintenanceDateKeyMap && !inDeleteMap ) {
            date = DateUtils.addTime( date, { days: 1 } );
            dateKey = getDateKey( date );
            inDeleteMap = ( dateKey in serviceMaintenanceToDeleteMap )
        }
        if( inDeleteMap ) {

            const serviceMaintenanceId = serviceMaintenanceDateKeyMap[ dateKey ];
            if( typeof serviceMaintenanceId === "string" )
                await restoreServiceMaintenanceRow( serviceMaintenanceId );
            return;

        }
        const { serviceMaintenanceDataMap, serviceMaintenanceIndex } = pageData;
        serviceMaintenanceDataMap[ serviceMaintenanceIndex ] = {
            service: null as unknown as DocumentReference,
            date,
            price: null as unknown as number,
            commissionPercentage: null as unknown as number,
            status: null as unknown as serviceMaintenanceStatus
        }
        pageData.serviceMaintenanceIndex++;
        serviceMaintenanceDateKeyMap[ dateKey ] = serviceMaintenanceIndex;
        reloadPageData();

    }

    async function checkServiceData(): Promise< boolean > {

        return await ServiceUtils.checkServiceData( pageData.serviceData )

    }

    async function checkServiceMaintenanceKeyDate( date: Date ): Promise< boolean > {

        const { serviceMaintenanceDateKeyMap } = pageData;
        if( DateUtils.toString( date, "yyyymmdd" ) in serviceMaintenanceDateKeyMap )
            throw new Error( `Date already used.` );
        return true;

    }

    async function createService(): Promise< void > {

        if( !isNewMode || !documentId ) return;
        const documentReference: DocumentReference = await ServiceUtils.createService(
            pageData.serviceData
        );
        pageData.serviceDocumentReference = documentReference;
        await updateServiceMaintenanceList();
        alert( `Created!` ); // note: remove later
        window.open( `/management/services/${ documentReference.id }`, `_self`);

    }

    async function createServiceMaintenanceList(): Promise< void > {

        const {
            serviceDocumentReference,
            serviceMaintenanceDataMap,
            serviceMaintenanceDefaultDataMap,
            serviceMaintenanceDateKeyMap
        } = pageData;
        if( !serviceDocumentReference ) return;
        for( let serviceMaintenanceId in serviceMaintenanceDataMap ) {

            const isNew: boolean = NumberUtils.isNumeric( serviceMaintenanceId );
            if( !isNew ) continue;
            const serviceMaintenanceData = serviceMaintenanceDataMap[ serviceMaintenanceId ];
            serviceMaintenanceData.service = serviceDocumentReference;
            const
                serviceMaintenanceDocumentReference =
                    await ServiceMaintenanceUtils.createServiceMaintenance( serviceMaintenanceData )
                ,
                serviceMaintenanceIdNew: string = serviceMaintenanceDocumentReference.id,
                dateKey: string = getDateKey( serviceMaintenanceData.date )
            ;
            delete serviceMaintenanceDataMap[ serviceMaintenanceId ];
            serviceMaintenanceDataMap[ serviceMaintenanceIdNew ] = serviceMaintenanceData;
            serviceMaintenanceDefaultDataMap[ serviceMaintenanceIdNew ] =
                DataMapUtils.clone( serviceMaintenanceData )
            ;
            serviceMaintenanceDateKeyMap[ dateKey ] = serviceMaintenanceIdNew;

        }

    }

    async function deleteService(): Promise< void > {

        if( !isEditMode || !documentId ) return;
        const { serviceMaintenanceDataMap } = pageData;
        for( let serviceMaintenanceId in serviceMaintenanceDataMap )
            await deleteServiceMaintenanceRow( serviceMaintenanceId );
        await updateServiceMaintenanceList();
        await ServiceUtils.deleteService( documentId );
        alert( `Deleted!` ); // note: remove later
        window.open( `/management/services/menu`, `_self`);

    }

    async function deleteServiceMaintenanceRow(
        serviceMaintenanceId: documentId | number
    ): Promise< void > {

        const
            {
                serviceMaintenanceDataMap,
                serviceMaintenanceDateKeyMap,
                serviceMaintenanceToDeleteMap
            } = pageData,
            serviceMaintenanceData: ServiceMaintenanceData = serviceMaintenanceDataMap[
                serviceMaintenanceId
            ],
            dateKey: string = getDateKey( serviceMaintenanceData.date ),
            isNewServiceMaintenance: boolean = (
                ( typeof serviceMaintenanceId === "number" )
                || NumberUtils.isNumeric( serviceMaintenanceId )
            )
        ;
        if( isNewServiceMaintenance ) {

            delete serviceMaintenanceDataMap[ serviceMaintenanceId ];
            delete serviceMaintenanceDateKeyMap[ dateKey ];

        } else
            serviceMaintenanceToDeleteMap[ serviceMaintenanceId ] = true;
        reloadPageData();

    }

    async function deleteServiceMaintenanceListInToDeleteMap(): Promise< void > {

        const {
            serviceMaintenanceDataMap,
            serviceMaintenanceDefaultDataMap,
            serviceMaintenanceDateKeyMap,
            serviceMaintenanceToDeleteMap
        } = pageData;
        for( let serviceMaintenanceId in serviceMaintenanceToDeleteMap ) {

            const dateKey: string = getDateKey( serviceMaintenanceDataMap[ serviceMaintenanceId ].date );
            await ServiceMaintenanceUtils.deleteServiceMaintenance( serviceMaintenanceId );
            delete serviceMaintenanceDataMap[ serviceMaintenanceId ];
            delete serviceMaintenanceDefaultDataMap[ serviceMaintenanceId ];
            delete serviceMaintenanceDateKeyMap[ dateKey ];
            delete serviceMaintenanceToDeleteMap[ serviceMaintenanceId ];

        }

    }

    function getDateKey( date: Date ): string {

        return DateUtils.toString( date, "yyyymmdd" );

    }

    function handleServiceMaintenanceDateChange(
        serviceMaintenanceId: string | number, date: Date | null, old: Date | null
    ): void {

        if( !date || !old ) return;
        const
            { serviceMaintenanceDateKeyMap } = pageData,
            dateKeyOld: string = getDateKey( old ),
            dateKeyNew: string = getDateKey( date )
        ;
        delete serviceMaintenanceDateKeyMap[ dateKeyOld ];
        serviceMaintenanceDateKeyMap[ dateKeyNew ] = serviceMaintenanceId;

    }

    async function newServiceForm(): Promise< void > {

        pageData.serviceData = {
            name: null as unknown as string,
            description: null as unknown as string,
            serviceType: null as unknown as serviceType,
            roomType: null as unknown as roomType,
            ageLimit: null as unknown as number,
            durationMin: null as unknown as number
        }

    }

    async function openServiceForm(): Promise< void > {

        if( !documentId ) return;
        pageData.serviceDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.SERVICE_COLLECTION
        );
        pageData.serviceData = await ServiceUtils.getServiceData( documentId );
        pageData.serviceMaintenanceDataMap =
            await ServiceMaintenanceUtils.getServiceMaintenanceListByService( documentId )
        ;
        const { serviceData, serviceMaintenanceDataMap, serviceMaintenanceDateKeyMap } = pageData;
        pageData.serviceDefaultData = { ...serviceData };
        pageData.serviceMaintenanceDefaultDataMap = DataMapUtils.clone( serviceMaintenanceDataMap );
        for( let serviceMaintenanceId in serviceMaintenanceDataMap ) {

            const dateKey: string = getDateKey(
                serviceMaintenanceDataMap[ serviceMaintenanceId ].date
            );
            serviceMaintenanceDateKeyMap[ dateKey ] = serviceMaintenanceId;

        }

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function restoreServiceMaintenanceRow( serviceMaintenanceId: documentId ): Promise< void > {

        const { serviceMaintenanceToDeleteMap } = pageData;
        delete serviceMaintenanceToDeleteMap[ serviceMaintenanceId ];
        reloadPageData();

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();

        if( isNewMode )
            await createService();
        else
            await updateService();

    }

    async function updateService(): Promise< void > {

        if( !isEditMode || !documentId ) return;
        await ServiceUtils.updateService( documentId, pageData.serviceData );
        await updateServiceMaintenanceList();
        reloadPageData();
        alert( `Updated!` ); // note: remove later

    }

    async function updateServiceMaintenanceList(): Promise< void > {

        await deleteServiceMaintenanceListInToDeleteMap();
        await updateServiceMaintenanceListInUpdateMap();
        await createServiceMaintenanceList();

    }

    async function updateServiceMaintenanceListInUpdateMap(): Promise< void > {

        const {
            serviceMaintenanceDataMap,
            serviceMaintenanceDefaultDataMap,
            updateMap
        } = pageData;
        for( let serviceMaintenanceId in updateMap ) {

            const isServiceMaintenanceId: boolean = serviceMaintenanceId in serviceMaintenanceDataMap;
            if( !isServiceMaintenanceId ) continue;
            const serviceMaintenanceData = serviceMaintenanceDataMap[ serviceMaintenanceId ];
            await ServiceMaintenanceUtils.updateServiceMaintenance(
                serviceMaintenanceId, serviceMaintenanceData
            );
            delete updateMap[ serviceMaintenanceId ];
            serviceMaintenanceDefaultDataMap[ serviceMaintenanceId ] = DataMapUtils.clone(
                serviceMaintenanceData
            );

        }

    }

    async function validateServiceMaintenanceDate( date: Date | null ): Promise< boolean > {

        if( !date ) return false;
        const dateKey: string = getDateKey( date );
        if( !( dateKey in pageData.serviceMaintenanceDateKeyMap ) ) return true;
        alert( "Date already chosen!" );
        return false;

    }

    useEffect( () => { ( async() => {
        
        if( !documentId ) return;
        await ( isNewMode ? newServiceForm() : openServiceForm() );
        reloadPageData();

    } )() }, [] );

    return <>
        <form onSubmit={ submit }>
            <h1>ID: { documentId }</h1>
            <label>Name</label>
            <FormTinyTextInput documentData={ pageData.serviceData } documentDefaultData={ pageData.serviceDefaultData } documentId={ documentId } keyName="name" pageData={ pageData } required={ true }/>
            <label>Description</label>
            <FormTextInput documentData={ pageData.serviceData } documentDefaultData={ pageData.serviceDefaultData } documentId={ documentId } keyName="description" pageData={ pageData } required={ true }/>
            <label>Service Type</label>
            <FormSelect documentData={ pageData.serviceData } documentDefaultData={ pageData.serviceDefaultData } documentId={ documentId } keyName="serviceType" optionList={ SpaRadiseEnv.SERVICE_TYPE_LIST } pageData={ pageData } required={ true }>
                <option value="" disabled>Choose Service Type</option>
                <option value="body">Body</option>
                <option value="browsAndLashes">Brows and Lashes</option>
                <option value="facial">Facial</option>
                <option value="handsAndFeet">Hands and Feet</option>
                <option value="health">Health</option>
                <option value="wax">Wax</option>
            </FormSelect>
            <label>Room Type</label>
            <FormSelect documentData={ pageData.serviceData } documentDefaultData={ pageData.serviceDefaultData } documentId={ documentId } keyName="roomType" optionList={ SpaRadiseEnv.ROOM_TYPE_LIST } pageData={ pageData } required={ true }>
                <option value="" disabled>Choose Service Type</option>
                <option value="room">Room</option>
                <option value="chair">Chair</option>
            </FormSelect>
            <label>Age Limit</label>
            <FormNaturalNumberInput documentData={ pageData.serviceData } documentDefaultData={ pageData.serviceDefaultData } documentId={ documentId } keyName="ageLimit" pageData={ pageData } required={ true }/>
            <label>Duration (min)</label>
            <FormNaturalNumberInput documentData={ pageData.serviceData } documentDefaultData={ pageData.serviceDefaultData } documentId={ documentId } keyName="durationMin" max={ 120 } min={ 30 } pageData={ pageData } required={ true } step={ 30 }/>
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
            <button type="button" onClick={ checkServiceData }>Check</button>
            <button type="button" onClick={ deleteService }>Delete</button>
            <button type="submit">Submit</button>

            <h1>Maintenance</h1>
            {
                Object.keys( pageData.serviceMaintenanceDateKeyMap ).sort().map( ( keyDate, key ) => {
                        
                    const
                        {
                            serviceMaintenanceDataMap,
                            serviceMaintenanceDateKeyMap,
                            serviceMaintenanceDefaultDataMap,
                            serviceMaintenanceToDeleteMap
                        } = pageData,
                        documentId: string | number = serviceMaintenanceDateKeyMap[ keyDate ],
                        inputDocumentId: string | undefined = ( !NumberUtils.isNumeric( documentId ) ? documentId as string : undefined ),
                        serviceMaintenanceData: ServiceMaintenanceData = serviceMaintenanceDataMap[ documentId ],
                        serviceMaintenanceDefaultData: ServiceMaintenanceData = serviceMaintenanceDefaultDataMap[ documentId ]
                    ;
                    if( serviceMaintenanceToDeleteMap[ documentId ] ) return undefined;
                    return <div key={ key }>
                        <h4>Maintenance { key }</h4>
                        <label>Date</label>
                        <FormDateInput
                            documentData={ serviceMaintenanceData }
                            documentDefaultData={ serviceMaintenanceDefaultData }
                            documentId={ inputDocumentId } keyName="date"
                            onChange={ ( date, _, old ) => handleServiceMaintenanceDateChange( documentId, date, old ) }
                            pageData={ pageData } required={ true }
                            validate={ date => validateServiceMaintenanceDate( date ) }
                        />
                        <label>Price</label>
                        <FormMoneyInput documentData={ serviceMaintenanceData } documentDefaultData={ serviceMaintenanceDefaultData } documentId={ inputDocumentId } keyName="price" min={ 0.01 } pageData={ pageData } required={ true }/>
                        <label>Commission Percentage</label>
                        <FormPercentageInput documentData={ serviceMaintenanceData } documentDefaultData={ serviceMaintenanceDefaultData } documentId={ inputDocumentId } keyName="commissionPercentage" min={ 0.01 } pageData={ pageData } required={ true }/>
                        <label>Status</label>
                        <FormSelect documentData={ serviceMaintenanceData } documentDefaultData={ serviceMaintenanceDefaultData } documentId={ inputDocumentId } keyName="status" optionList={ SpaRadiseEnv.SERVICE_MAINTENANCE_STATUS_TYPE_LIST } pageData={ pageData } required={ true }>
                            <option value="" disabled>Choose Service Type</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </FormSelect>
                        <button type="button" onClick={ () => deleteServiceMaintenanceRow( documentId ) }>Delete</button>
                    </div>
                } )
            }
            <button type="button" onClick={ addServiceMaintenanceRow }>Add</button>
        </form>

    </>

}
