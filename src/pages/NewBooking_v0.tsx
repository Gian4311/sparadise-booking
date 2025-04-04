import {
    AccountData,
    BookingData,
    ClientData,
    ClientDataMap,
    EmployeeDataMap,
    EmployeeLeaveDataMap,
    JobDataMap,
    JobServiceDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    PackageServiceDataMap,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import BookingCalendar from "../utils/BookingCalendar";
import BookingUtils from "../firebase/BookingUtils";
import Bullet from "../components/Bullet";
import DateUtils from "../utils/DateUtils";
import { documentId, DocumentReference } from "firebase/firestore/lite";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeUtils from "../firebase/EmployeeUtils";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import JobServiceUtils from "../firebase/JobServiceUtils";
import JobUtils from "../firebase/JobUtils";
import NewBookingDateInput from "../components/NewBookingDateInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageServiceUtils from "../firebase/PackageServiceUtils";
import PackageUtils from "../firebase/PackageUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceTransactionTimeSlot from "../components/ServiceTransactionTimeSlot";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import StringUtils from "../utils/StringUtils";
import { useParams } from "react-router-dom";
import EmployeeSidebar from "../components/EmployeeSidebar";

import "../styles/NewBooking_v0.css"

export interface NewBookingPageData extends SpaRadisePageData {
    
    accountData: AccountData,
    bookingCalendar: BookingCalendar,
    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    clientIndex: number,
    clientIndexActive: number,
    clientInfoMap: { [ clientIndex: number ]: {
        packageIncluded: { [ packageId: documentId ]: boolean },
        serviceIncludedMap: { [ serviceId: documentId ]: number },
        serviceTransactionDataMap: { [ serviceTransactionId: string ]: ServiceTransactionData },
        serviceTransactionIndex: number,
        showPackages: boolean,
        showServices: boolean,
        singleServiceIncluded: { [ serviceId: documentId ]: boolean }
    } },
    date: Date,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveOfDayDataMap: EmployeeLeaveDataMap,
    formIndex: number,
    jobDataMap: JobDataMap,
    jobServiceDataMap: JobServiceDataMap,
    maintenanceDataMap: { [documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    packageServiceDataMap: PackageServiceDataMap,
    packageServiceKeyMap: {
        [ packageId: documentId ]: { [ packageServiceId: documentId ]: documentId }
    },
    serviceDataMap: ServiceDataMap,
    serviceTransactionOfDayDataMap: ServiceTransactionDataMap
}

export default function NewBooking(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< NewBookingPageData >( {
            accountData: {} as AccountData,
            bookingCalendar: null as unknown as BookingCalendar,
            bookingData: {
                account: null as unknown as DocumentReference,
                reservedDateTime: null as unknown as Date,
                activeDateTime: null,
                finishedDateTime: null,
                canceledDateTime: null
            },
            clientDataMap: {} as ClientDataMap,
            clientIndex: 0,
            clientIndexActive: 0,
            clientInfoMap: {},
            date: DateUtils.toFloorByDay( DateUtils.addTime( new Date(), { day: 14 } ) ),
            employeeDataMap: {},
            employeeLeaveOfDayDataMap: {},
            formIndex: 0,
            jobDataMap: {},
            jobServiceDataMap: {},
            loaded: false,
            maintenanceDataMap: {},
            packageDataMap: {} as PackageDataMap,
            packageServiceDataMap: {} as PackageServiceDataMap,
            packageServiceKeyMap: {},
            serviceDataMap: {} as ServiceDataMap,
            serviceTransactionOfDayDataMap: {},
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

    async function handleChangeDate(): Promise< void > {

        if( !pageData.loaded ) return;
        await loadMaintenanceData();
        const { date } = pageData;
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay( date )
        ;
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay( date )
        ;
        await loadBookingCalendar();

    }

    async function loadBookingCalendar(): Promise< void > {

        const
            { employeeLeaveOfDayDataMap, serviceTransactionOfDayDataMap } = pageData,
            serviceTransactionDataMap: ServiceTransactionDataMap = {
                ...serviceTransactionOfDayDataMap
            },
            bookingCalendarPageData = {
                ...pageData,
                employeeLeaveDataMap: employeeLeaveOfDayDataMap,
                serviceTransactionDataMap
            }
        ;
        pageData.bookingCalendar = new BookingCalendar( bookingCalendarPageData );

    }

    async function loadEmployeeData(): Promise< void > {

        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();

    }

    async function loadFirstClient(): Promise< void > {

        const { accountData, accountData: { birthDate } } = pageData;
        pageData.clientDataMap[ -1 ] = {
            booking: null as unknown as DocumentReference,
            name: PersonUtils.format( accountData, "f mi l" ),
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

    async function loadJobData(): Promise< void > {

        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.jobServiceDataMap = await JobServiceUtils.getJobServiceDataMapAll();

    }

    async function loadMaintenanceData(): Promise< void > {

        const { date } = pageData;
        if( !date ) {

            pageData.maintenanceDataMap = {};
            reloadPageData();
            return;

        }
        const
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate( date )
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate( date )
        ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };
        reloadPageData();

    }

    async function loadPageData(): Promise< void > {

        if( !accountId ) return;
        pageData.accountData = await AccountUtils.getAccountData( accountId );
        pageData.bookingData.account = SpaRadiseFirestore.getDocumentReference(
            accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        await loadFirstClient();
        await loadServiceData();
        await loadEmployeeData();
        await loadJobData();
        pageData.loaded = true;
        await handleChangeDate();
        reloadPageData();

    }

    async function loadServiceData(): Promise< void > {

        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        pageData.packageServiceDataMap = await PackageServiceUtils.getPackageServiceDataMapAll();
        const { packageDataMap, packageServiceDataMap, packageServiceKeyMap } = pageData;
        for( let packageId in packageDataMap ) packageServiceKeyMap[ packageId ] = {};
        for( let packageServiceId in packageServiceDataMap ) {

            const {
                package: { id: packageId }, service: { id: serviceId }
            } = packageServiceDataMap[ packageServiceId ];
            packageServiceKeyMap[ packageId ][ packageServiceId ] = serviceId;

        }

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise< void > {

        event.preventDefault();
        await createBooking();

    }

    useEffect( () => { loadPageData(); }, [] );

    useEffect( () => { handleChangeDate(); }, [ pageData.date ] );

    return <>
    {/* <EmployeeSidebar/> */}
        <h1>Account ID: { accountId }</h1>
        <form onSubmit={ submit }>
            {
                ( pageData.formIndex === 0 ) ? <ChooseClients pageData={ pageData } reloadPageData={ reloadPageData }/>
                : ( pageData.formIndex === 1 ) ? <ChooseServices pageData={ pageData } reloadPageData={ reloadPageData }/>
                : ( pageData.formIndex === 2 ) ? <ChooseTimeSlots pageData={ pageData } reloadPageData={ reloadPageData }/>
                // other form indexes
                : <button type="button" onClick={ () => { pageData.formIndex--; reloadPageData(); } }>None, Go Back</button>
            }
            
            <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
        </form>

    </>

}

function ChooseClients( { pageData, reloadPageData }: {
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

    function loadClientIndexActive(): void {

        let minimum: number = Infinity;
        for( let keyName in clientDataMap ) {

            const index = +keyName;
            if( index < minimum ) minimum = index;

        }
        pageData.clientIndexActive = minimum;

    }

    async function nextPage(): Promise< void > {

        await checkFormValidity();
        pageData.formIndex++;
        loadClientIndexActive();
        reloadPageData();

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
        <button type="button" onClick={ nextPage }>Proceed (1/4)</button>
    </>;

}

function ChooseServices( { pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        {
            clientDataMap, clientIndexActive, clientInfoMap, maintenanceDataMap, packageDataMap,
            packageServiceKeyMap, serviceDataMap
        } = pageData,
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

        const
            { serviceTransactionIndex } = clientInfoMap[ clientIndexActive ],
            serviceTransactionId: string = getServiceTransactionId(
                clientIndexActive, serviceTransactionIndex
            )
        ;
        serviceTransactionDataMap[ serviceTransactionId ] = {
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
            { clientDataMap, date } = pageData
        ;
        if( !date )
            throw new Error( "No booking date given! ");
        const isSunday: boolean = ( date.getDay() === 0 );
        if( isSunday )
            throw new Error( "Booking date cannot be on a Sunday!" );
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

    async function handleChangeClientActive( clientIndex: number ): Promise< void > {

        pageData.clientIndexActive = clientIndex;
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
        pageData.formIndex++;
        reloadPageData();

    }

    async function previousPage(): Promise< void > {

        pageData.formIndex--;
        reloadPageData();

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
        <h1>Choose date</h1>
        <NewBookingDateInput pageData={ pageData } reloadPageData={ reloadPageData }/>
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
                
                const { price, status } = maintenanceDataMap[ packageId ];
                if( status === "inactive" ) return undefined;

                const
                    { name, description } = packageDataMap[ packageId ],
                    serviceKeyMap = packageServiceKeyMap[ packageId ],
                    serviceKeyList = Object.keys( serviceKeyMap )
                        .filter( packageServiceId => {

                            const
                                serviceId: string = serviceKeyMap[ packageServiceId ],
                                { status } = maintenanceDataMap[ serviceId ]
                            ;
                            return ( status === "active" );

                        } ).map( packageServiceId => serviceKeyMap[ packageServiceId ] )
                ;
                if( serviceKeyList.length <= 1 ) return <></>;

                return <div className="package-box" key={ packageId }>
                    <h3>{ name }</h3>
                    Description:
                    <p>{ description }<br/>Price: { price }</p>
                    <ul>{
                        serviceKeyList.sort(
                            ( serviceId1, serviceId2 ) => StringUtils.compare(
                                serviceDataMap[ serviceId1 ].name,
                                serviceDataMap[ serviceId2 ].name
                            )
                        ).map( serviceId => {

                            const { name } = serviceDataMap[ serviceId ];
                            return <li className={ isConflictingService( serviceId ) ? `included` : `` } key={ serviceId }>{ name }</li>;

                        } )
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
                
                const
                    { name, description } = serviceDataMap[ serviceId ],
                    { status } = maintenanceDataMap[ serviceId ]
                ;
                if( status === "inactive" ) return undefined;
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
        <label>Notes</label>
        <FormTextArea documentData={ clientDataMap[ clientIndexActive ] } keyName="notes" pageData={ pageData } required={ true }/>
        <button type="button" onClick={ previousPage }>Back</button>
        <button type="button" onClick={ nextPage }>Proceed (2/4)</button>
    </>;

}

function ChooseTimeSlots( { pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
} ): JSX.Element {

    const
        {
            clientDataMap, clientIndexActive, clientInfoMap, date
        } = pageData,
        weekDay: number = date.getDay()
    ;

    async function checkFormValidity(): Promise< boolean > {
    
        return true;

    }

    async function handleChangeClientActive( clientIndex: number ): Promise< void > {

        pageData.clientIndexActive = clientIndex;
        reloadPageData();

    }

    async function nextPage(): Promise< void > {

        pageData.formIndex++;
        reloadPageData();

    }

    async function previousPage(): Promise< void > {

        pageData.formIndex--;
        reloadPageData();

    }

    return <>
        <h1>Choose Time Slots</h1>
        <h1>Date: { DateUtils.toString( pageData.date, "Mmmm dd, yyyy" ) }</h1>
        <ul>{
            Object.keys( clientDataMap ).sort().map( clientIndex => 
                <li
                    className={ ( +clientIndex == clientIndexActive ) ? `active` : `` }
                    key={ clientIndex }
                    onClick={ () => handleChangeClientActive( +clientIndex ) }
                >{ clientDataMap[ clientIndex ].name }</li>
            )
        }</ul>
        <p>
            Services marked<Bullet color="#ffc100" size="12px" style={ { margin: "0 5px" } }/>
            can be done together with<Bullet color="#6699ff" size="12px" style={ { margin: "0 5px" } }/>
            or<Bullet color="#3bba23" size="12px" style={ { margin: "0 5px" } }/>.
        </p>
        <table>
            <thead><tr>
                <td></td>
                <td>Service</td>
                <td>Time Slot</td>
                <td>Duration</td>
            </tr></thead>
            <tbody>{
                Object.keys( pageData.clientInfoMap[ clientIndexActive ].serviceTransactionDataMap ).map( serviceTransactionId => {
                    
                    const
                        serviceTransactionData = pageData
                            .clientInfoMap[ clientIndexActive ]
                            .serviceTransactionDataMap[ serviceTransactionId ]
                        ,
                        { service: { id: serviceId } } = serviceTransactionData,
                        { name, serviceType, durationMin } = pageData.serviceDataMap[ serviceId ]
                    ;
                    return <tr key={ serviceTransactionId }>
                        <td>{
                            ( serviceType === "handsAndFeet" ) ? <Bullet color="#ffc100" size="12px" style={ { margin: "0 5px" } }/>
                            : ( serviceType === "browsAndLashes" ) ? <Bullet color="#6699ff" size="12px" style={ { margin: "0 5px" } }/>
                            : ( serviceType === "facial" ) ? <Bullet color="#3bba23" size="12px" style={ { margin: "0 5px" } }/>
                            : <Bullet color="#cd8385" size="12px" style={ { margin: "0 5px" } }/>
                        }</td>
                        <td>{ name }</td>
                        <td>
                            <ServiceTransactionTimeSlot clientId={ clientIndexActive.toString() } documentData={ serviceTransactionData } duration={ durationMin } keyNameFrom="bookingFromDateTime" keyNameTo="bookingToDateTime" pageData={ pageData } serviceTransactionId={ serviceTransactionId } reloadPageData={ reloadPageData }>
                                <option value="" disabled>Select time slot</option>
                            </ServiceTransactionTimeSlot>
                        </td>
                        <td></td>
                    </tr>;

                } )
            }</tbody>
        </table>
        <button type="button" onClick={ previousPage }>Back</button>
        <button type="button" onClick={ nextPage }>Proceed (3/4)</button>
    </>;

}

export function getServiceTransactionId(
    clientIndex: number, serviceTransactionIndex: number
): string {

    return `${ clientIndex }_${ serviceTransactionIndex }`;

}
