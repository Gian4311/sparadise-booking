import {
    AccountData,
    BookingData,
    ClientData,
    ClientDataMap,
    PackageDataMap,
    PackageServiceDataMap,
    ServiceDataMap,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import BookingUtils from "../firebase/BookingUtils";
import DateUtils from "../utils/DateUtils";
import { documentId, DocumentReference } from "firebase/firestore/lite";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PackageServiceUtils from "../firebase/PackageServiceUtils";
import PackageUtils from "../firebase/PackageUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useParams } from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

import "../styles/NewBooking_v0.css"

interface NewBookingPageData extends SpaRadisePageData {
    
    accountData: AccountData,
    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    clientIndex: number,
    clientInfoMap: { [ clientIndex: number ]: {
        packageIncluded: { [ packageId: documentId ]: boolean },
        serviceIncludedMap: { [ serviceId: documentId ]: number },
        serviceTransactionDataMap: { [ serviceTransactionIndex: number ]: ServiceTransactionData },
        serviceTransactionIndex: number,
        showPackages: boolean,
        showServices: boolean,
        singleServiceIncluded: { [ serviceId: documentId ]: boolean }
    } },
    formIndex: number,
    packageDataMap: PackageDataMap,
    packageServiceDataMap: PackageServiceDataMap,
    packageServiceKeyMap: {
        [ packageId: documentId ]: { [ packageServiceId: documentId ]: documentId }
    },
    serviceDataMap: ServiceDataMap
}

export default function NewBooking(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< NewBookingPageData >( {
            accountData: {} as AccountData,
            bookingData: {
                account: null as unknown as DocumentReference,
                reservedDateTime: null as unknown as Date,
                activeDateTime: null,
                finishedDateTime: null,
                canceledDateTime: null
            },
            clientDataMap: {} as ClientDataMap,
            clientIndex: 0,
            clientInfoMap: {},
            formIndex: 0,
            loaded: false,
            packageDataMap: {} as PackageDataMap,
            packageServiceDataMap: {} as PackageServiceDataMap,
            packageServiceKeyMap: {},
            serviceDataMap: {} as ServiceDataMap,
            updateMap: {}
        } ),
        accountId: string | undefined = useParams().accountId
    ;

    function addFormIndex( value: number = 1 ): void {

        pageData.formIndex += value;
        reloadPageData();

    }

    async function createBooking(): Promise< void > {



    }

    async function checkFormValidity(): Promise< boolean > {
    
        // const {
        //     bookingData
        // } = pageData;
        // if( bookingData.name === "New Booking" )
        //     throw new Error( `Booking name cannot be "New Booking"!` );
        // // check if duplicate name
        // const noServices: number =
        //     ObjectUtils.keyLength( bookingServiceIncludedMap )
        //     - ObjectUtils.keyLength( bookingServiceToDeleteMap )
        // ;
        // if( noServices < 1 )
        //     throw new Error( `There must be at least 1 booking service.` );
        return true;

    }

    async function loadFirstClient(): Promise< void > {

        const { accountData: { birthDate, firstName, middleName, lastName } } = pageData;
        pageData.clientDataMap[ -1 ] = {
            booking: null as unknown as DocumentReference,
            name: PersonUtils.format( firstName, middleName, lastName, "f mi l" ),
            birthDate,
            notes: null
        };
        pageData.clientInfoMap[ -1 ] = {
            packageIncluded: {},
            serviceIncludedMap: {},
            serviceTransactionDataMap: {},
            serviceTransactionIndex: 0,
            showPackages: true,
            showServices: false,
            singleServiceIncluded: {}
        };

    }

    async function loadPageData(): Promise< void > {

        if( !accountId ) return;
        pageData.accountData = await AccountUtils.getAccountData( accountId );
        pageData.bookingData.account = SpaRadiseFirestore.getDocumentReference(
            accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        await loadFirstClient();
        await loadServiceData();
        reloadPageData();

    }

    async function loadServiceData(): Promise< void > {

        pageData.serviceDataMap = await ServiceUtils.getServiceListAll();
        pageData.packageDataMap = await PackageUtils.getPackageListAll();
        pageData.packageServiceDataMap = await PackageServiceUtils.getPackageServiceListAll();
        const { packageDataMap, packageServiceDataMap, packageServiceKeyMap } = pageData;
        for( let packageId in packageDataMap ) packageServiceKeyMap[ packageId ] = {};
        for( let packageServiceId in packageServiceDataMap ) {

            const {
                package: { id: packageId }, service: { id: serviceId }
            } = packageServiceDataMap[ packageServiceId ];
            packageServiceKeyMap[ packageId ][ packageServiceId ] = serviceId;

        }
        pageData.loaded = true;

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        await createBooking();

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <h1>Account ID: { accountId }</h1>
        <form onSubmit={ submit }>
            {
                ( pageData.formIndex === 0 ) ? <ChooseClients addFormIndex={ addFormIndex } pageData={ pageData } reloadPageData={ reloadPageData }/>
                : ( pageData.formIndex === 1 ) ? <ChooseServices addFormIndex={ addFormIndex } pageData={ pageData } reloadPageData={ reloadPageData }/>
                // other form indexes
                : <>none</>
            }
            
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
        </form>

    </>

}

function ChooseClients( { addFormIndex, pageData, reloadPageData }: {
    addFormIndex: ( value?: number ) => void,
    pageData: NewBookingPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        { clientDataMap, clientInfoMap } = pageData,
        clientLength: number = ObjectUtils.keyLength( clientDataMap )
    ;

    async function addClient(): Promise< void > {
    
        const { clientDataMap, clientIndex } = pageData;
        clientDataMap[ clientIndex ] = {
            booking: null as unknown as DocumentReference,
            name: null as unknown as string,
            birthDate: null as unknown as Date,
            notes: null
        };
        clientInfoMap[ clientIndex ] = {
            packageIncluded: {},
            serviceIncludedMap: {},
            serviceTransactionDataMap: {},
            serviceTransactionIndex: 0,
            showPackages: true,
            showServices: false,
            singleServiceIncluded: {}
        };
        pageData.clientIndex++;
        reloadPageData();

    }

    async function checkFormValidity(): Promise< boolean > {
    
        const
            { MIN_AGE_LIMIT } = SpaRadiseEnv,
            { clientDataMap } = pageData
        ;
        if( !ObjectUtils.hasKeys( clientDataMap ) )
            throw new Error( `There must be at least 1 client!` );
        for( let clientId in clientDataMap ) {

            const { name, birthDate } = clientDataMap[ clientId ];
            if( !name ) throw new Error( `Client names cannot be empty!` );
            // check for duplicate names
            if( !birthDate ) throw new Error( `Birth dates cannot be empty!` );
            if( DateUtils.getYearAge( birthDate ) < MIN_AGE_LIMIT )
                throw new Error( `The age limit is ${ MIN_AGE_LIMIT } years old!` );

        }
        return true;

    }

    async function deleteClient( clientIndex: number ): Promise< void > {

        delete clientDataMap[ clientIndex ];
        delete clientInfoMap[ clientIndex ];
        reloadPageData();

    }

    async function nextPage(): Promise< void > {

        await checkFormValidity();
        addFormIndex();

    }

    async function previousPage(): Promise< void > {

        window.open( `/home`, `_self` );

    }

    return <>
        <h1>Who are the Clients?</h1>
        {
            Object.keys( clientDataMap ).sort().map( ( clientIndex, index ) => {

                const clientData: ClientData = clientDataMap[ clientIndex ];
                return <div key={ index }>
                    <label>Name</label>
                    <FormTinyTextInput documentData={ clientData } keyName="name" pageData={ pageData } required={ true }/>
                    <label>Birth Date</label>
                    <FormDateInput documentData={ clientData } keyName="birthDate" pageData={ pageData } required={ true }/>
                    {
                        ( clientLength > 1 ) ? <button type="button" onClick={ () => deleteClient( +clientIndex ) }>Delete</button>
                        : <></>
                    }
                </div>;

            } )
        }
        <button type="button" onClick={ addClient }>Add</button>
        <button type="button" onClick={ previousPage }>Back</button>
        <button type="button" onClick={ nextPage }>Proceed (1/3)</button>
    </>;

}

function ChooseServices( { addFormIndex, pageData, reloadPageData }: {
    addFormIndex: ( value?: number ) => void,
    pageData: NewBookingPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        {
            clientDataMap, clientInfoMap, packageDataMap,  packageServiceKeyMap, serviceDataMap
        } = pageData,
        [ clientIndexActive, setClientIndexActive ] = useState< number >( getFirstClientIndex ),
        {
            packageIncluded, serviceIncludedMap, serviceTransactionDataMap, singleServiceIncluded,
            showPackages, showServices
        } = clientInfoMap[ clientIndexActive ]
    ;

    async function addPackage( packageId: documentId ): Promise< void > {

        if( isConflictingPackage( packageId ) ) return;
        const packageServiceMap = packageServiceKeyMap[ packageId ];
        for( let packageServiceId in packageServiceMap ) {

            const serviceId: string = packageServiceMap[ packageServiceId ];
            await addServiceTransaction( serviceId, packageId );

        }
        packageIncluded[ packageId ] = true;
        reloadPageData();

    }

    async function addServiceTransaction(
        serviceId: documentId, packageId?: documentId
    ): Promise< void > {

        const { serviceTransactionIndex } = clientInfoMap[ clientIndexActive ];
        serviceTransactionDataMap[ serviceTransactionIndex ] = {
            client: null as unknown as DocumentReference,
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            ),
            package: packageId ? SpaRadiseFirestore.getDocumentReference(
                packageId, SpaRadiseEnv.PACKAGE_COLLECTION
            ) : null,
            status: "uncanceled",
            bookingFromDateTime: null as unknown as Date,
            bookingToDateTime: null as unknown as Date,
            actualBookingFromDateTime: null,
            actualBookingToDateTime: null,
            employee: null,
            notes: null
        };
        serviceIncludedMap[ serviceId ] = serviceTransactionIndex;
        clientInfoMap[ clientIndexActive ].serviceTransactionIndex++;

    }

    async function addSingleService( serviceId: documentId ): Promise< void > {

        if( isConflictingService( serviceId ) ) return;
        await addServiceTransaction( serviceId );
        singleServiceIncluded[ serviceId ] = true;
        reloadPageData();

    }

    async function checkFormValidity(): Promise< boolean > {
    
        const
            { MIN_AGE_LIMIT } = SpaRadiseEnv,
            { clientDataMap } = pageData
        ;
        for( let clientId in clientDataMap ) {

            const { name, birthDate } = clientDataMap[ clientId ];
            if( !name ) throw new Error( `Client names cannot be empty!` );
            // check for duplicate names
            if( !birthDate ) throw new Error( `Birth dates cannot be empty!` );
            if( DateUtils.getYearAge( birthDate ) < MIN_AGE_LIMIT )
                throw new Error( `The age limit is ${ MIN_AGE_LIMIT } years old!` );

        }
        return true;

    }

    async function deletePackage( packageId: documentId ): Promise< void > {

        const packageServiceMap = packageServiceKeyMap[ packageId ];
        for( let packageServiceId in packageServiceMap ) {

            const serviceId: string = packageServiceMap[ packageServiceId ];
            await deleteServiceTransaction( serviceId );

        }
        delete packageIncluded[ packageId ];
        reloadPageData();

    }

    async function deleteServiceTransaction( serviceId: documentId ): Promise< void > {

        const serviceTransactionIndex = serviceIncludedMap[ serviceId ];
        delete serviceTransactionDataMap[ serviceTransactionIndex ];
        delete serviceIncludedMap[ serviceId ];

    }

    async function deleteSingleService( serviceId: documentId ): Promise< void > {

        await deleteServiceTransaction( serviceId );
        delete singleServiceIncluded[ serviceId ];
        reloadPageData();

    }

    function getFirstClientIndex(): number {

        let minimum: number = Infinity;
        for( let keyName in clientDataMap ) {

            const index = +keyName;
            if( index < minimum ) minimum = index;

        }
        return minimum;

    }

    async function handleChangeClientActive( clientIndex: number ): Promise< void > {

        setClientIndexActive( clientIndex );
        reloadPageData();

    }

    function isConflictingPackage( packageId: documentId ): boolean {

        const packageServiceMap = packageServiceKeyMap[ packageId ];
        for( let packageServiceId in packageServiceMap ) {

            const serviceId: string = packageServiceMap[ packageServiceId ];
            if( isConflictingService( serviceId ) ) return true;

        }
        return false;

    }

    function isConflictingService( serviceId: documentId ): boolean {

        return serviceId in serviceIncludedMap;

    }

    async function nextPage(): Promise< void > {

        await checkFormValidity();
        addFormIndex();

    }

    async function previousPage(): Promise< void > {

        addFormIndex( -1 );

    }

    function togglePackages(): void {

        clientInfoMap[ clientIndexActive ].showPackages =
            !clientInfoMap[ clientIndexActive ].showPackages
        ;
        reloadPageData();

    }

    function toggleServices(): void {

        clientInfoMap[ clientIndexActive ].showServices =
            !clientInfoMap[ clientIndexActive ].showServices
        ;
        reloadPageData();

    }

    return <>
        <h1>Choose services</h1>
        <ul>{
            Object.keys( clientDataMap ).sort().map( clientIndex => 
                <li
                    className={ ( +clientIndex == clientIndexActive ) ? `active` : `` }
                    key={ clientIndex }
                    onClick={ () => handleChangeClientActive( +clientIndex ) }
                >{ clientDataMap[ clientIndex ].name }</li>
            )
        }</ul>
        <button type="button" onClick={ togglePackages }><h1>Packages</h1></button>
        <div className={ showPackages ? `` : `hidden` }>{
            Object.keys( packageDataMap ).map( packageId => {
                
                const
                    { name, description } = packageDataMap[ packageId ],
                    serviceKeyMap = packageServiceKeyMap[ packageId ]
                ;
                return <div className="package-box" key={ packageId }>
                    <h3>{ name }</h3>
                    Description:
                    <p>{ description }</p>
                    <ul>{
                        Object.keys( serviceKeyMap ).map( packageServiceId => serviceKeyMap[ packageServiceId ] ).sort(
                            ( serviceId1, serviceId2 ) => {

                                const
                                    { name: name1 } = serviceDataMap[ serviceId1 ],
                                    { name: name2 } = serviceDataMap[ serviceId2 ]
                                ;
                                return ( name1 > name2 ) ? 1 : -1;

                            }
                        ).map(
                            serviceId => {

                                const { name } = serviceDataMap[ serviceId ];
                                return <li className={ isConflictingService( serviceId ) ? `included` : `` } key={ serviceId }>{ name }</li>;

                            }
                        )
                    }</ul>
                    {
                        ( packageId in packageIncluded ) ?  <button type="button" onClick={ () => deletePackage( packageId ) }>Remove</button>
                        : isConflictingPackage( packageId ) ? <button type="button">In Conflict</button>
                        : <button type="button" onClick={ () => addPackage( packageId ) }>Add</button>
                    }
                </div>;

            } )
        }</div>
        <button type="button" onClick={ toggleServices }><h1>Services</h1></button>
        <div className={ showServices ? `` : `hidden` }>{
            Object.keys( serviceDataMap ).map( serviceId => {
                
                const { name, description } = serviceDataMap[ serviceId ];
                return <div className="package-box" key={ serviceId }>
                    <h3>{ name }</h3>
                    Description:
                    <p>{ description }</p>
                    {
                        ( serviceId in singleServiceIncluded ) ?  <button type="button" onClick={ () => deleteSingleService( serviceId ) }>Remove</button>
                        : isConflictingService( serviceId ) ? <button type="button">In Conflict</button>
                        : <button type="button" onClick={ () => addSingleService( serviceId ) }>Add</button>
                    }
                </div>;

            } )
        }</div>
        <button type="button" onClick={ previousPage }>Back</button>
        <button type="button" onClick={ nextPage }>Proceed (1/3)</button>
    </>;

}
