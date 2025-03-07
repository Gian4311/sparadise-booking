import { DocumentReference } from "firebase/firestore/lite";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import {
    AccountData,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import AccountServiceUtils from "../firebase/AccountServiceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

interface AccountManagementPageData extends SpaRadisePageData {
    
    jobDefaultData: AccountData,
    jobData: AccountData,
    jobDocumentReference?: DocumentReference,
    jobServiceDataMap: AccountServiceDataMap,
    jobServiceIncludedMap: { [ serviceId: documentId ]: documentId | number },
    jobServiceIndex: number,
    jobServiceToDeleteMap: { [ jobServiceId: documentId ]: boolean },
    serviceDataMap: ServiceDataMap

}

export default function MyAccount(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< AccountManagementPageData >( {
            jobData: {
                name: null as unknown as string,
                description: null as unknown as string
            },
            jobDefaultData: {} as AccountData,
            jobServiceDataMap: {},
            jobServiceIncludedMap: {},
            jobServiceIndex: 0,
            jobServiceToDeleteMap: {},
            serviceDataMap: {},
            updateMap: {}
        } ),
        documentId: string | undefined = useParams().id,
        isNewMode: boolean = ( documentId === "new" ),
        isEditMode: boolean = ( documentId !== undefined && !isNewMode )
    ;

    async function addAccountService( serviceId: string ): Promise< void > {

        const
            { jobServiceIncludedMap, jobServiceToDeleteMap } = pageData,
            jobServiceId = jobServiceIncludedMap[ serviceId ] as string
        ;
        if( jobServiceId in jobServiceToDeleteMap ) {

            await restoreAccountServiceInclusion( jobServiceId );
            return;

        }
        const
            {
                jobServiceDataMap,
                jobServiceIndex
            } = pageData
        ;
        jobServiceDataMap[ jobServiceIndex ] = {
            job: null as unknown as DocumentReference,
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            )
        };
        pageData.jobServiceIndex++;
        jobServiceIncludedMap[ serviceId ] = jobServiceIndex;
        reloadPageData();

    }

    async function cancelAccountForm(): Promise< void > {

        window.open( `/management/jobs/menu`, `_self`);

    }

    async function checkFormValidity(): Promise< boolean > {
    
        const {
            jobData,
            jobServiceIncludedMap,
            jobServiceToDeleteMap
        } = pageData;
        if( jobData.name === "New Account" )
            throw new Error( `Account name cannot be "New Account"!` );
        // check if duplicate name
        const noServices: number =
            ObjectUtils.keyLength( jobServiceIncludedMap )
            - ObjectUtils.keyLength( jobServiceToDeleteMap )
        ;
        if( noServices < 1 )
            throw new Error( `There must be at least 1 job service.` );
        return true;

    }

    async function createAccount(): Promise< void > {

        if( !isNewMode || !documentId ) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await AccountUtils.createAccount(
            pageData.jobData
        );
        pageData.jobDocumentReference = documentReference;
        await updateAccountServiceList();
        delete pageData.updateMap[ "new" ];
        alert( `Created!` ); // note: remove later
        window.open( `/management/jobs/${ documentReference.id }`, `_self`);

    }

    async function createAccountServiceList(): Promise< void > {

        const {
            jobDocumentReference,
            jobServiceDataMap,
            jobServiceIncludedMap
        } = pageData;
        if( !jobDocumentReference ) return;
        for( let jobServiceId in jobServiceDataMap ) {

            const isNew: boolean = NumberUtils.isNumeric( jobServiceId );
            if( !isNew ) continue;
            const jobServiceData = jobServiceDataMap[ jobServiceId ];
            jobServiceData.job = jobDocumentReference;
            const
                jobServiceDocumentReference =
                    await AccountServiceUtils.createAccountService( jobServiceData )
                ,
                jobServiceIdNew: string = jobServiceDocumentReference.id,
                serviceId: string = jobServiceData.service.id
            ;
            delete jobServiceDataMap[ jobServiceId ];
            jobServiceDataMap[ jobServiceIdNew ] = jobServiceData;
            jobServiceIncludedMap[ serviceId ] = jobServiceIdNew;

        }

    }

    async function deleteAccount(): Promise< void > {

        if( !isEditMode || !documentId ) return;
        const {
            jobServiceDataMap, jobServiceIncludedMap
        } = pageData;
        for( let jobServiceId in jobServiceDataMap )
            await deleteAccountService( jobServiceIncludedMap[ jobServiceId ] as string );
        await updateAccountServiceList();
        await AccountUtils.deleteAccount( documentId );
        alert( `Deleted!` ); // note: remove later
        window.open( `/management/jobs/menu`, `_self`);

    }

    async function deleteAccountService( serviceId: documentId ): Promise< void > {

        const
            {
                jobServiceDataMap,
                jobServiceIncludedMap,
                jobServiceToDeleteMap
            } = pageData,
            jobServiceId: string | number = jobServiceIncludedMap[ serviceId ],
            isNewAccountService: boolean =  NumberUtils.isNumeric( jobServiceId )
        ;
        if( isNewAccountService ) {

            delete jobServiceDataMap[ jobServiceId ];
            delete jobServiceIncludedMap[ serviceId ];

        } else
            jobServiceToDeleteMap[ jobServiceId ] = true;
        reloadPageData();

    }

    async function deleteAccountServiceListInToDeleteMap(): Promise< void > {

        const {
            jobServiceDataMap,
            jobServiceIncludedMap,
            jobServiceToDeleteMap
        } = pageData;
        for( let jobServiceId in jobServiceToDeleteMap ) {

            const serviceId: string = jobServiceDataMap[ jobServiceId ].service.id;
            await AccountServiceUtils.deleteAccountService( jobServiceId );
            delete jobServiceDataMap[ jobServiceId ];
            delete jobServiceIncludedMap[ serviceId ];
            delete jobServiceToDeleteMap[ jobServiceId ];

        }

    }

    async function loadAccount(): Promise< void > {

        if( !documentId ) return;
        pageData.jobDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.JOB_COLLECTION
        );
        pageData.jobData = await AccountUtils.getAccountData( documentId );
        pageData.jobDefaultData = { ...pageData.jobData };
        await loadAccountServiceList();

    }

    async function loadAccountServiceList(): Promise< void > {

        if( !documentId ) return;
        pageData.jobServiceDataMap =
            await AccountServiceUtils.getAccountServiceListByAccount( documentId )
        ;
        const { jobServiceDataMap, jobServiceIncludedMap } = pageData;
        for( let jobServiceId in jobServiceDataMap ) {

            const serviceId: string = jobServiceDataMap[ jobServiceId ].service.id;
            jobServiceIncludedMap[ serviceId ] = jobServiceId;

        }

    }

    async function loadPageData(): Promise< void > {

        if( !documentId ) return;
        pageData.serviceDataMap = await ServiceUtils.getServiceListAll();
        if( isEditMode ) await loadAccount();
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function restoreAccountServiceInclusion( jobServiceId: string ): Promise< void > {

        const { jobServiceToDeleteMap } = pageData;
        delete jobServiceToDeleteMap[ jobServiceId ];
        reloadPageData();

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        if( isNewMode )
            await createAccount();
        else
            await updateAccount();

    }

    async function updateAccount(): Promise< void > {

        if( !isEditMode || !documentId ) return;
        await checkFormValidity();
        const { updateMap } = pageData;
        if( documentId in updateMap ) {
        
            await AccountUtils.updateAccount( documentId, pageData.jobData );
            pageData.jobDefaultData = { ...pageData.jobData };

        }
        delete updateMap[ documentId ];
        await updateAccountServiceList();
        reloadPageData();
        alert( `Updated!` ); // note: remove later

    }

    async function updateAccountServiceList(): Promise< void > {

        await deleteAccountServiceListInToDeleteMap();
        await createAccountServiceList();

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        jefwhjfewiihfihefwihefih
        <form onSubmit={ submit }>
            <h1>ID: { documentId }</h1>
            <label>Name</label>
            <FormTinyTextInput documentData={ pageData.jobData } documentDefaultData={ pageData.jobDefaultData } documentId={ documentId } keyName="name" pageData={ pageData } required={ true }/>
            <label>Description</label>
            <FormTextArea documentData={ pageData.jobData } documentDefaultData={ pageData.jobDefaultData } documentId={ documentId } keyName="description" pageData={ pageData } required={ true }/>
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
            <button type="button" onClick={ deleteAccount }>Delete</button>
            <button type="submit">Submit</button>

            <h1>Services</h1>
            {
                Object.keys( pageData.serviceDataMap ).map( ( serviceId, key ) => {

                    const
                        service = pageData.serviceDataMap[ serviceId ],
                        jobServiceId: string | number = pageData.jobServiceIncludedMap[ serviceId ]
                    ;
                    return <div key={ key }>
                        { service.name }
                        {
                            (
                                !( serviceId in pageData.jobServiceIncludedMap )
                                || ( jobServiceId in pageData.jobServiceToDeleteMap )
                            ) ? (
                                <button type="button" onClick={ () => addAccountService( serviceId ) }>Add</button>
                            ) : (
                                <button type="button" onClick={ () => deleteAccountService( serviceId ) }>Remove</button>
                            )
                        }
                        
                    </div>;

                } )
            }
        </form>

    </>

}
