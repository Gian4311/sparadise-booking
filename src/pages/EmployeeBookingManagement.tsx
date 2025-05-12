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
import DateUtils from "../utils/DateUtils";
import DayPlanner from "../components/DayPlanner";
import { DocumentReference } from "firebase/firestore/lite";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import {
    FormEvent,
    useEffect,
    useState
} from "react";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import LoadingScreen from "../components/LoadingScreen";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import JobUtils from "../firebase/JobUtils";
import JobServiceUtils from "../firebase/JobServiceUtils";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageUtils from "../firebase/PackageUtils";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";

interface EmployeeBookingManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    bookingData: BookingData,
    bookingDefaultData: BookingData,
    bookingDataMap: BookingDataMap,
    bookingDocumentReference?: DocumentReference,
    clientDataMap: ClientDataMap,
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

    }

    async function previousPage(): Promise< void > {

        navigate( -1 );

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise<void> {

        event.preventDefault();

    }

    useEffect( () => { loadPageData(); }, [] );

    return <>
        <LoadingScreen loading={ !pageData.loaded }/>
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
                <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
            </form>
        </main>
    </>

}
