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
    
    JobData,
    JobServiceDataMap,
    ServiceDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import JobUtils from "../firebase/JobUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

interface JobManagementPageData extends SpaRadisePageData {
    
    jobDefaultData: JobData,
    jobData: JobData,
    jobDocumentReference?: DocumentReference,
    jobServiceDataMap: JobServiceDataMap,
    jobServiceIncludedMap: { [ serviceId: documentId ]: documentId | number },
    jobServiceIndex: number,
    jobServiceToDeleteMap: { [ jobServiceId: documentId ]: boolean },
    serviceDataMap: ServiceDataMap

}

export default function BookingCreation(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< JobManagementPageData >( {
            jobData: {
                name: null as unknown as string,
                description: null as unknown as string
            },
            jobDefaultData: {} as JobData,
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

    async function addJobService( serviceId: string ): Promise< void > {

        const
            { jobServiceIncludedMap, jobServiceToDeleteMap } = pageData,
            jobServiceId = jobServiceIncludedMap[ serviceId ] as string
        ;
        if( jobServiceId in jobServiceToDeleteMap ) {

            await restoreJobServiceInclusion( jobServiceId );
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

    async function cancelJobForm(): Promise< void > {

        window.open( `/management/jobs/menu`, `_self`);

    }

    async function checkFormValidity(): Promise< boolean > {
    
        const {
            jobData,
            jobServiceIncludedMap,
            jobServiceToDeleteMap
        } = pageData;
        if( jobData.name === "New Job" )
            throw new Error( `Job name cannot be "New Job"!` );
        // check if duplicate name
        const noServices: number =
            ObjectUtils.keyLength( jobServiceIncludedMap )
            - ObjectUtils.keyLength( jobServiceToDeleteMap )
        ;
        if( noServices < 1 )
            throw new Error( `There must be at least 1 job service.` );
        return true;

    }

    async function createJob(): Promise< void > {

        if( !isNewMode || !documentId ) return;
        await checkFormValidity();
        const documentReference: DocumentReference = await JobUtils.createJob(
            pageData.jobData
        );
        pageData.jobDocumentReference = documentReference;
        await updateJobServiceList();
        delete pageData.updateMap[ "new" ];
        alert( `Created!` ); // note: remove later
        window.open( `/management/jobs/${ documentReference.id }`, `_self`);

    }

    async function createJobServiceList(): Promise< void > {

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
                    await JobServiceUtils.createJobService( jobServiceData )
                ,
                jobServiceIdNew: string = jobServiceDocumentReference.id,
                serviceId: string = jobServiceData.service.id
            ;
            delete jobServiceDataMap[ jobServiceId ];
            jobServiceDataMap[ jobServiceIdNew ] = jobServiceData;
            jobServiceIncludedMap[ serviceId ] = jobServiceIdNew;

        }

    }

    async function deleteJob(): Promise< void > {

        if( !isEditMode || !documentId ) return;
        const {
            jobServiceDataMap, jobServiceIncludedMap
        } = pageData;
        for( let jobServiceId in jobServiceDataMap )
            await deleteJobService( jobServiceIncludedMap[ jobServiceId ] as string );
        await updateJobServiceList();
        await JobUtils.deleteJob( documentId );
        alert( `Deleted!` ); // note: remove later
        window.open( `/management/jobs/menu`, `_self`);

    }

    async function deleteJobService( serviceId: documentId ): Promise< void > {

        const
            {
                jobServiceDataMap,
                jobServiceIncludedMap,
                jobServiceToDeleteMap
            } = pageData,
            jobServiceId: string | number = jobServiceIncludedMap[ serviceId ],
            isNewJobService: boolean =  NumberUtils.isNumeric( jobServiceId )
        ;
        if( isNewJobService ) {

            delete jobServiceDataMap[ jobServiceId ];
            delete jobServiceIncludedMap[ serviceId ];

        } else
            jobServiceToDeleteMap[ jobServiceId ] = true;
        reloadPageData();

    }

    async function deleteJobServiceListInToDeleteMap(): Promise< void > {

        const {
            jobServiceDataMap,
            jobServiceIncludedMap,
            jobServiceToDeleteMap
        } = pageData;
        for( let jobServiceId in jobServiceToDeleteMap ) {

            const serviceId: string = jobServiceDataMap[ jobServiceId ].service.id;
            await JobServiceUtils.deleteJobService( jobServiceId );
            delete jobServiceDataMap[ jobServiceId ];
            delete jobServiceIncludedMap[ serviceId ];
            delete jobServiceToDeleteMap[ jobServiceId ];

        }

    }

    async function loadJob(): Promise< void > {

        if( !documentId ) return;
        pageData.jobDocumentReference = SpaRadiseFirestore.getDocumentReference(
            documentId, SpaRadiseEnv.JOB_COLLECTION
        );
        pageData.jobData = await JobUtils.getJobData( documentId );
        pageData.jobDefaultData = { ...pageData.jobData };
        await loadJobServiceList();

    }

    async function loadJobServiceList(): Promise< void > {

        if( !documentId ) return;
        pageData.jobServiceDataMap =
            await JobServiceUtils.getJobServiceListByJob( documentId )
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
        if( isEditMode ) await loadJob();
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function restoreJobServiceInclusion( jobServiceId: string ): Promise< void > {

        const { jobServiceToDeleteMap } = pageData;
        delete jobServiceToDeleteMap[ jobServiceId ];
        reloadPageData();

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        if( isNewMode )
            await createJob();
        else
            await updateJob();

    }

    async function updateJob(): Promise< void > {

        if( !isEditMode || !documentId ) return;
        await checkFormValidity();
        const { updateMap } = pageData;
        if( documentId in updateMap ) {
        
            await JobUtils.updateJob( documentId, pageData.jobData );
            pageData.jobDefaultData = { ...pageData.jobData };

        }
        delete updateMap[ documentId ];
        await updateJobServiceList();
        reloadPageData();
        alert( `Updated!` ); // note: remove later

    }

    async function updateJobServiceList(): Promise< void > {

        await deleteJobServiceListInToDeleteMap();
        await createJobServiceList();

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <form onSubmit={ submit }>
            <h1>ID: { documentId }</h1>
            <label>Name</label>
            <FormTinyTextInput documentData={ pageData.jobData } documentDefaultData={ pageData.jobDefaultData } documentId={ documentId } keyName="name" pageData={ pageData } required={ true }/>
            <label>Description</label>
            <FormTextArea documentData={ pageData.jobData } documentDefaultData={ pageData.jobDefaultData } documentId={ documentId } keyName="description" pageData={ pageData } required={ true }/>
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
            <button type="button" onClick={ deleteJob }>Delete</button>
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
                                <button type="button" onClick={ () => addJobService( serviceId ) }>Add</button>
                            ) : (
                                <button type="button" onClick={ () => deleteJobService( serviceId ) }>Remove</button>
                            )
                        }
                        
                    </div>;

                } )
            }
        </form>

    </>

}
