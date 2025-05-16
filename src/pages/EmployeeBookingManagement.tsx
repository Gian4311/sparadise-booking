import {
    AccountData,
    BookingData,
    BookingDataMap,
    ClientData,
    ClientDataMap,
    EmployeeData,
    EmployeeDataMap,
    EmployeeLeaveDataMap,
    JobDataMap,
    JobServiceDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    ServiceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionAvailabilityKeyMap,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    ServiceTransactionEmployeeListKeyMap,
    SpaRadisePageData
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import BookingUtils from "../firebase/BookingUtils";
import ClientUtils from "../firebase/ClientUtils";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import DayPlanner from "../components/DayPlanner";
import { DocumentReference } from "firebase/firestore/lite";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import FormEmployeeSelect from "../components/FormEmployeeSelect";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormMarkButton from "../components/FormMarkButton";
import FormTextArea from "../components/FormTextArea";
import FormTimeInput from "../components/FormTimeInput";
import FormTinyTextInput from "../components/FormTinyTextInput";
import LoadingScreen from "../components/LoadingScreen";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import JobUtils from "../firebase/JobUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageUtils from "../firebase/PackageUtils";
import PopupModal from "../components/PopupModal";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseDataMapUtils from "../firebase/SpaRadiseDataMapUtils";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import {
    useNavigate,
    useParams
} from "react-router-dom";

import "../styles/FormTimeInput.scss"

interface EmployeeBookingManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    bookingData: BookingData,
    bookingDefaultData: BookingData,
    bookingDataMap: BookingDataMap,
    bookingDocumentReference?: DocumentReference,
    clientDataMap: ClientDataMap,
    clientIdActive: documentId,
    clientInfoMap: {
        [ clientId: string ]: ServiceTransactionDataMap
    },
    date: Date,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveOfDayDataMap: EmployeeLeaveDataMap,
    jobDataMap: JobDataMap,
    jobServiceDataMap: JobServiceDataMap,
    maintenanceDataMap: { [ documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionDefaultDataMap: ServiceTransactionDataMap,
    serviceTransactionEmployeeListKeyMap: ServiceTransactionEmployeeListKeyMap,
    serviceTransactionOfDayDataMap: ServiceTransactionDataMap

}

export default function EmployeeBookingManagement(): JSX.Element {

    const
        [ pageData, setPageData ] = useState< EmployeeBookingManagementPageData >( {
            accountData: { email: "" } as AccountData,
            bookingData: {
                account: null as unknown as DocumentReference,
                activeDateTime: null as unknown as Date,
                canceledDateTime: null as unknown as Date,
                finishedDateTime: null as unknown as Date,
                reservedDateTime: null as unknown as Date
            },
            bookingDefaultData: {} as BookingData,
            bookingDataMap: {},
            clientDataMap: {},
            clientIdActive: null as unknown as string,
            clientInfoMap: {},
            date: null as unknown as Date,
            employeeDataMap: {},
            employeeLeaveOfDayDataMap: {},
            jobDataMap: {},
            jobServiceDataMap: {},
            loaded: false,
            maintenanceDataMap: {},
            packageDataMap: {},
            serviceDataMap: {},
            serviceTransactionDefaultDataMap: {},
            serviceTransactionEmployeeListKeyMap: {},
            serviceTransactionOfDayDataMap: {},
            updateMap: {}
        } ),
        bookingId: string | undefined = useParams().id,
        dayPlannerPageData = {
            ...pageData,
            employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
            serviceTransactionDefaultDataMap: pageData.serviceTransactionOfDayDataMap,
            serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
        },
        navigate = useNavigate()
    ;

    async function checkFormValidity(): Promise< boolean > {
    
        // const {
        //     jobData,
        //     serviceIncludedMap,
        //     jobServiceToDeleteMap
        // } = pageData;
        // if( jobData.name === "New Job" )
        //     throw new Error( `Job name cannot be "New Job"!` );
        // // check if duplicate name
        // const noServices: number =
        //     ObjectUtils.keyLength( serviceIncludedMap )
        //     - ObjectUtils.keyLength( jobServiceToDeleteMap )
        // ;
        // if( noServices < 1 )
        //     throw new Error( `There must be at least 1 job service.` );
        return true;

    }

    async function handleChangeClientActive( clientId: string ): Promise< void > {

        pageData.clientIdActive = clientId;
        reloadPageData();

    }

    async function loadBookingData(): Promise< void > {
    
        pageData.bookingDataMap = await BookingUtils.getBookingDataMapAll();
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay( pageData.date, false )
        ;
        if( !bookingId ) return;
        pageData.bookingData = pageData.bookingDataMap[ bookingId ];
        pageData.bookingDefaultData = { ...pageData.bookingData };
        pageData.accountData = await AccountUtils.getAccountData( pageData.bookingData.account );
        const { clientDataMap, clientInfoMap } = pageData;
        let clientId: documentId = "";
        for( clientId in clientDataMap )
            if( clientDataMap[ clientId ].booking.id === bookingId )
                clientInfoMap[ clientId ] = {};
        const
            serviceTransactionOfClientDataMap: ServiceTransactionDataMap =
                await ServiceTransactionUtils.getServiceTransactionDataMapByClient( clientId )
            ,
            serviceTransactionId: documentId = Object.keys( serviceTransactionOfClientDataMap )[ 0 ]
        ;
        pageData.date = DateUtils.setTime(
            serviceTransactionOfClientDataMap[ serviceTransactionId ].bookingDateTimeStart,
            { hr: 12, min: 0 }
        );

    }

    async function loadClientData(): Promise< void > {
    
        pageData.clientDataMap = await ClientUtils.getClientDataMapAll();
        pageData.clientIdActive =
            ObjectUtils.getFirstKeyName( pageData.clientDataMap ) ?? null as unknown as string
        ;

    }

    async function loadEmployeeData(): Promise<void> {
        
        const { date } = pageData;
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay( date )
        ;

    }

    async function loadJobData(): Promise< void > {
        
        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.jobServiceDataMap = await JobServiceUtils.getJobServiceDataMapAll();

    }

    async function loadMaintenanceData(): Promise<void> {
    
        const
            { date } = pageData,
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate( date )
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate( date )
        ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };

    }

    async function loadPageData(): Promise< void > {

        await loadClientData();
        await loadBookingData();
        await loadServiceData();
        await loadMaintenanceData();
        await loadJobData();
        await loadMaintenanceData();
        await loadEmployeeData();
        await loadServiceTransactionData();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadServiceData(): Promise< void > {
        
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();

    }

    async function loadServiceTransactionData(): Promise< void > {

        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay( pageData.date, false )
        ;
        const { clientInfoMap, serviceTransactionOfDayDataMap } = pageData;
        for( let serviceTransactionId in serviceTransactionOfDayDataMap ) {

            const
                serviceTransactionData = serviceTransactionOfDayDataMap[ serviceTransactionId ],
                clientId = serviceTransactionData.client.id
            ;
            if( clientId in clientInfoMap )
                clientInfoMap[ clientId ][ serviceTransactionId ] = serviceTransactionData;

        }
        pageData.serviceTransactionDefaultDataMap = SpaRadiseDataMapUtils.clone(
            serviceTransactionOfDayDataMap
        );

    }

    async function previousPage(): Promise< void > {

        navigate( -1 );

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    function setActiveBooking( date: Date | null ): void {

        if( !bookingId ) return;
        const {
            bookingData: { activeDateTime },
            bookingData, bookingDefaultData, updateMap
        } = pageData;
        if( activeDateTime && date && date >= activeDateTime ) return;
        bookingData.activeDateTime = date;
        const
            dateDefault = bookingDefaultData.activeDateTime,
            isDefault: boolean = ( dateDefault && date ) ? DateUtils.areSameByMinute(
                dateDefault, date
            ) : !date,
            hasUpdateRecord: boolean = ( bookingId in updateMap )
        ;
        if( isDefault ) {

            if( hasUpdateRecord ) delete updateMap[ bookingId ].activeDateTime;
            if( !ObjectUtils.hasKeys( updateMap[ bookingId ] ) ) delete updateMap[ bookingId ];

        } else {

            if( !hasUpdateRecord ) updateMap[ bookingId ] = {};
            updateMap[ bookingId ].activeDateTime = true;

        }

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise<void> {

        event.preventDefault();

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <LoadingScreen loading={ !pageData.loaded }/>
        <PopupModal pageData={ pageData } reloadPageData={ reloadPageData } />
        <EmployeeSidebar/>
        <main className="employee-booking-management-main-content">
            <button type="button" onClick={ previousPage }>{ "<---" }</button>
            <p>
                Account: { pageData.accountData.email }
                <br/>
                Booking ID: { bookingId }
                <br/>
                Booking Date: { pageData.date ? DateUtils.toString( pageData.date, "Mmmm dd, yyyy" ) : "" }
                <br/>
                Reserved At: {
                    pageData.bookingData.reservedDateTime ? DateUtils.toString( pageData.bookingData.reservedDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
                <br/>
                Active At: {
                    pageData.bookingData.activeDateTime ? DateUtils.toString( pageData.bookingData.activeDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
                <br/>
                Finished At: {
                    pageData.bookingData.finishedDateTime ? DateUtils.toString( pageData.bookingData.finishedDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
                <br/>
                Canceled At: {
                    pageData.bookingData.canceledDateTime ? DateUtils.toString( pageData.bookingData.canceledDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
            </p>
            <form onSubmit={ submit }>
                <DayPlanner dayPlannerMode="management" pageData={ dayPlannerPageData } show={ false }/>
                <section className="client-input">
                    <label className="client-selection">Select Client:</label>
                    <div className="clickable-bars" id="client-selection">
                        {
                            Object.keys( pageData.clientDataMap ).map( clientId =>
                                <div
                                    className={ `client-item ${ ( clientId === pageData.clientIdActive ) ? 'active' : '' }` }
                                    data-client={ `client${ clientId }` }
                                    key={ clientId }
                                    onClick={ () => handleChangeClientActive( clientId ) }
                                >
                                    { pageData.clientDataMap[ clientId ].name }
                                </div>
                            )
                        }
                    </div>
                </section>
                <section className="service-scroll-container">{
                    pageData.clientIdActive ? Object.keys( pageData.clientInfoMap[ pageData.clientIdActive ] ).map( serviceTransactionId => {

                        const
                            {
                                clientIdActive, clientInfoMap, date, employeeDataMap, packageDataMap,
                                serviceDataMap, serviceTransactionDefaultDataMap,
                                serviceTransactionEmployeeListKeyMap
                            } = pageData
                        ;
                        if( !serviceTransactionEmployeeListKeyMap[ serviceTransactionId ] )
                            return undefined;
                        const
                            serviceTransactionDataMap = clientInfoMap[ clientIdActive ],
                            serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                            {
                                service: { id: serviceId },
                                actualBookingDateTimeEnd, actualBookingDateTimeStart,
                                bookingDateTimeEnd, bookingDateTimeStart, canceled, employee
                            } = serviceTransactionData,
                            dateRange: DateRange = new DateRange(
                                bookingDateTimeStart, bookingDateTimeEnd
                            ),
                            packageId: string | undefined = serviceTransactionData.package?.id,
                            serviceTransactionDefaultData =
                                serviceTransactionDefaultDataMap[ serviceTransactionId ]
                            ,
                            serviceTransactionEmployeeDataMap: EmployeeDataMap = ObjectUtils.filter(
                                employeeDataMap,
                                employeeId =>
                                    serviceTransactionEmployeeListKeyMap
                                        [ serviceTransactionId ]
                                        .includes( employeeId )
                            ),
                            status = (
                                canceled ? "canceled"
                                : actualBookingDateTimeEnd ? "finished"
                                : actualBookingDateTimeStart ? "active"
                                : "pending"
                            )
                        ;

                        return <div className={ `service-scroll-item ${ status }` } key={ serviceTransactionId }>
                            <div className="service-name">{ serviceDataMap[ serviceId ].name }</div>
                            { packageId ? packageDataMap[ packageId ].name : "" }<br/>
                            Employee Assigned<br/>
                            { dateRange.toString( "h:mmAM-h:mmAM" ) }<br/>
                            <FormEmployeeSelect
                                documentData={ serviceTransactionData }
                                documentDefaultData={ serviceTransactionDefaultData }
                                documentId={ serviceTransactionId }
                                employeeDataMap={ serviceTransactionEmployeeDataMap }
                                pageData={ pageData }
                                keyName="employee"
                                readOnly={ canceled }
                                required={ true }
                                onChange={ reloadPageData }
                            >
                                <option value="">Assign employee</option>
                            </FormEmployeeSelect>
                            <br/>
                            Actual Start Time<br/>
                            <FormTimeInput
                                className={ canceled ? "na" : "start" }
                                date={ date }
                                documentData={ serviceTransactionData }
                                documentDefaultData={ serviceTransactionDefaultData }
                                documentId={ serviceTransactionId }
                                pageData={ pageData }
                                keyName="actualBookingDateTimeStart"
                                readOnly={ canceled || !employee }
                                required={ true }
                                onChange={ date => { setActiveBooking( date ); reloadPageData() } }
                            />
                            <br/>
                            Actual End Time<br/>
                            <FormTimeInput
                                className={ canceled ? "na" : "end" }
                                date={ date }
                                documentData={ serviceTransactionData }
                                documentDefaultData={ serviceTransactionDefaultData }
                                documentId={ serviceTransactionId }
                                min={ actualBookingDateTimeStart ? actualBookingDateTimeStart : undefined }
                                pageData={ pageData }
                                keyName="actualBookingDateTimeEnd"
                                readOnly={ canceled || !employee || !actualBookingDateTimeStart }
                                required={ true }
                                onChange={ () => reloadPageData() }
                            />
                            <br/>
                            Notes<br/>
                            <FormTextArea
                                documentData={ serviceTransactionData }
                                documentDefaultData={ serviceTransactionDefaultData }
                                documentId={ serviceTransactionId }
                                keyName="notes"
                                pageData={ pageData }
                            />
                            {
                                ( status === "canceled" ) ? `CANCELED`
                                : ( status === "finished" ) ? `FINISHED`
                                : <FormMarkButton< boolean >
                                    confirmMessage="Would you like to cancel this service transaction?"
                                    documentData={ serviceTransactionData }
                                    documentDefaultData={ serviceTransactionDefaultData }
                                    documentId={ serviceTransactionId }
                                    keyName="canceled"
                                    noText="Back"
                                    pageData={ pageData }
                                    value={ true }
                                    reloadPageData={ reloadPageData }
                                    yesText="Yes, Cancel This"
                                >CANCEL</FormMarkButton>
                            }
                        </div>;

                    } )
                    : undefined
                }</section>
                
                <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
            </form>
        </main>
    </>

}
