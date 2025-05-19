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
    PackageServiceDataMap,
    ServiceData,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionAvailabilityKeyMap,
    ServiceTransactionData,
    ServiceTransactionDataMap,
    ServiceTransactionEmployeeListKeyMap,
    SpaRadisePageData,
    VoucherDataMap,
    VoucherPackageDataMap,
    VoucherServiceDataMap,
    VoucherTransactionApplicationMap,
    VoucherTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import AccountUtils from "../firebase/AccountUtils";
import BookingReceipt from "../components/BookingReceipt";
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
import PackageServiceUtils from "../firebase/PackageServiceUtils";
import PackageUtils from "../firebase/PackageUtils";
import PersonUtils from "../utils/PersonUtils";
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
import VoucherPackageUtils from "../firebase/VoucherPackageUtils";
import VoucherServiceUtils from "../firebase/VoucherServiceUtils";
import VoucherTransactionUtils from "../firebase/VoucherTransactionUtils";
import VoucherUtils from "../firebase/VoucherUtils";

import "../styles/FormTimeInput.scss"

interface EmployeeBookingManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    bookingData: BookingData,
    bookingDefaultData: BookingData,
    bookingDataMap: BookingDataMap,
    bookingDocumentReference?: DocumentReference,
    clientDataMap: ClientDataMap,
    clientDefaultDataMap: ClientDataMap,
    clientIdActive: documentId,
    clientInfoMap: {
        [ clientId: string ]: {
            packageServiceTransactionDataMap: { [ packageId: documentId ]: ServiceTransactionDataMap },
            packageVoucherTransactionKeyMap: { [ packageId: documentId ]: documentId | undefined },
            serviceServiceTransactionKeyMap: { [ serviceId: documentId ]: documentId },
            serviceTransactionDataMap: ServiceTransactionDataMap,
            singleServiceVoucherTransactionKeyMap: { [ serviceId: documentId ]: documentId | undefined }
        }
    },
    date: Date,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveOfDayDataMap: EmployeeLeaveDataMap,
    formIndex: number,
    jobDataMap: JobDataMap,
    jobServiceDataMap: JobServiceDataMap,
    maintenanceDataMap: { [ documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    initialPrice: number,
    packageDataMap: PackageDataMap,
    packageServiceDataMap: PackageServiceDataMap,
    packageServiceKeyMap: {
        [packageId: documentId]: { [serviceId: documentId]: documentId }
    },
    serviceDataMap: ServiceDataMap,
    serviceTransactionDefaultDataMap: ServiceTransactionDataMap,
    serviceTransactionEmployeeListKeyMap: ServiceTransactionEmployeeListKeyMap,
    serviceTransactionOfDayDataMap: ServiceTransactionDataMap,
    voucherDataMap: VoucherDataMap,
    voucherDataOfDayMap: VoucherDataMap,
    voucherDiscount: number,
    voucherPackageKeyMap: {
        [voucherId: documentId]: { [packageId: documentId]: documentId }
    },
    voucherPackageMap: VoucherPackageDataMap,
    voucherServiceKeyMap: {
        [voucherId: documentId]: { [serviceId: documentId]: documentId }
    },
    voucherServiceMap: VoucherServiceDataMap,
    voucherTransactionApplicationMap: VoucherTransactionApplicationMap,
    voucherTransactionDataMap: VoucherTransactionDataMap,
    voucherTransactionDefaultDataMap: VoucherTransactionDataMap,
    voucherTransactionIndex: number

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
            clientDefaultDataMap: {},
            clientIdActive: null as unknown as string,
            clientInfoMap: {},
            date: null as unknown as Date,
            employeeDataMap: {},
            employeeLeaveOfDayDataMap: {},
            formIndex: 0,
            jobDataMap: {},
            jobServiceDataMap: {},
            loaded: false,
            maintenanceDataMap: {},
            initialPrice: 0,
            packageDataMap: {},
            packageServiceDataMap: {},
            packageServiceKeyMap: {},
            serviceDataMap: {},
            serviceTransactionDefaultDataMap: {},
            serviceTransactionEmployeeListKeyMap: {},
            serviceTransactionOfDayDataMap: {},
            updateMap: {},
            voucherDataMap: {},
            voucherDataOfDayMap: {},
            voucherDiscount: 0,
            voucherPackageKeyMap: {},
            voucherPackageMap: {},
            voucherServiceMap: {},
            voucherServiceKeyMap: {},
            voucherTransactionApplicationMap: {},
            voucherTransactionDataMap: {},
            voucherTransactionDefaultDataMap: {},
            voucherTransactionIndex: 0
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
                clientInfoMap[ clientId ] = {
                    packageServiceTransactionDataMap: {},
                    packageVoucherTransactionKeyMap: {},
                    serviceServiceTransactionKeyMap: {},
                    serviceTransactionDataMap: {},
                    singleServiceVoucherTransactionKeyMap: {}
                };
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
        await loadVoucherTransactionList();

    }

    async function loadClientData(): Promise< void > {
    
        pageData.clientDataMap = await ClientUtils.getClientDataMapAll();
        pageData.clientDefaultDataMap = SpaRadiseDataMapUtils.clone( pageData.clientDataMap );
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
        await loadVoucherData();
        await loadVoucherDataOfDayData();
        pageData.loaded = true;
        reloadPageData();

    }

    async function loadServiceData(): Promise< void > {
        
        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        pageData.packageServiceDataMap = await PackageServiceUtils.getPackageServiceDataMapAll();
            const { packageDataMap, packageServiceDataMap, packageServiceKeyMap } = pageData;
            for (let packageId in packageDataMap) packageServiceKeyMap[packageId] = {};
            for (let packageServiceId in packageServiceDataMap) {
    
                const {
                    package: { id: packageId }, service: { id: serviceId }
                } = packageServiceDataMap[packageServiceId];
                packageServiceKeyMap[packageId][serviceId] = packageServiceId;
    
            }

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
                clientInfoMap[ clientId ].serviceTransactionDataMap[ serviceTransactionId ] =
                    serviceTransactionData
                ;

        }
        pageData.serviceTransactionDefaultDataMap = SpaRadiseDataMapUtils.clone(
            serviceTransactionOfDayDataMap
        );

    }

    async function loadVoucherData(): Promise<void> {
    
        const
            { voucherPackageKeyMap, voucherServiceKeyMap } = pageData,
            voucherDataMap = await VoucherUtils.getVoucherDataMapAll(),
            voucherPackageDataMap = await VoucherPackageUtils.getVoucherPackageDataMapAll(),
            voucherServiceDataMap = await VoucherServiceUtils.getVoucherServiceDataMapAll()
            ;
        pageData.voucherDataMap = voucherDataMap;
        pageData.voucherPackageMap = voucherPackageDataMap;
        pageData.voucherServiceMap = voucherServiceDataMap;
        for (let voucherId in voucherDataMap) {

            voucherPackageKeyMap[voucherId] = {};
            voucherServiceKeyMap[voucherId] = {};

        }
        for (let voucherPackageId in voucherPackageDataMap) {

            const {
                voucher: { id: voucherId }, package: { id: packageId }
            } = voucherPackageDataMap[voucherPackageId];
            voucherPackageKeyMap[voucherId][packageId] = voucherPackageId;

        }
        for (let voucherServiceId in voucherServiceDataMap) {

            const {
                voucher: { id: voucherId }, service: { id: serviceId }
            } = voucherServiceDataMap[voucherServiceId];
            voucherServiceKeyMap[voucherId][serviceId] = voucherServiceId;

        }

    }

    async function loadVoucherDataOfDayData(): Promise<void> {
    
        ObjectUtils.clear( pageData.voucherDataOfDayMap );
        const
            { date, voucherDataMap, voucherDataOfDayMap } = pageData,
            dateTimeStart: Date = DateUtils.toFloorByDay(date),
            dateTimeEnd: Date = DateUtils.toCeilByDay(date),
            dateRange: DateRange = new DateRange(dateTimeStart, dateTimeEnd)
            ;
        for (let voucherId in voucherDataMap) {

            const
                voucherData = voucherDataMap[voucherId],
                { dateValid, dateExpiry } = voucherData,
                dateRangeCompare: DateRange = new DateRange(dateValid, dateExpiry)
                ;
            if (dateRange.overlapsWith(dateRangeCompare))
                voucherDataOfDayMap[voucherId] = voucherData;

        }
    }

    async function loadVoucherTransactionList(): Promise<void> {
    
        if (!bookingId) return;
        pageData.voucherTransactionDataMap =
            await VoucherTransactionUtils.getVoucherTransactionDataMapByBooking(bookingId)
            ;
        pageData.voucherTransactionDefaultDataMap =
            SpaRadiseDataMapUtils.clone(pageData.voucherTransactionDataMap)
            ;

    }

    async function previousPage(): Promise< void > {

        const formIndex: number = pageData.formIndex--;
        if( formIndex === 0 ) {
            
            navigate( -1 );
            return;

        }
        reloadPageData();

    }

    function reloadPageData(): void {

        setPageData( { ...pageData } );

    }

    async function submit( event: FormEvent< HTMLFormElement > ): Promise<void> {

        event.preventDefault();

    }

    useEffect( () => { loadPageData(); }, [] );

    const status = (
        pageData.bookingData.canceledDateTime ? "canceled"
        : pageData.bookingData.finishedDateTime ? "finished"
        : pageData.bookingData.activeDateTime ? "active"
        : pageData.bookingData.reservedDateTime ? "reserved"
        : "pending"
    );

    return <>
        <LoadingScreen loading={ !pageData.loaded }/>
        <PopupModal pageData={ pageData } reloadPageData={ reloadPageData } />
        <EmployeeSidebar/>
        <form onSubmit={submit} style={ { margin: "17.5%" } }>
            <button type="button" onClick={ previousPage }>{ "<---" }</button>
            <p>
                Name: { PersonUtils.toString( pageData.accountData, "f mi l" ) }
                <br/>
                Email: { pageData.accountData.email }
                <br/>
                Contact Number: { pageData.accountData.contactNumber }
                <br/>
                Alternate Contact Number: { pageData.accountData.contactNumberAlternate ?? "N/A" }
                <br/>
                Booking ID: { bookingId }
                <br/>
                Booking Date: { pageData.date ? DateUtils.toString( pageData.date, "Mmmm dd, yyyy" ) : "" }
                <br/>
                { ( status === "reserved" ) ? "<light>" : "<dot>" }
                Reserved At: {
                    pageData.bookingData.reservedDateTime ? DateUtils.toString( pageData.bookingData.reservedDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
                <br/>
                { ( status === "reserved" ) ? "<light>" : "<dot>" }
                Active At: {
                    pageData.bookingData.activeDateTime ? DateUtils.toString( pageData.bookingData.activeDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
                <br/>
                { ( status === "finished" ) ? "<light>" : "<dot>" }
                Finished At: {
                    pageData.bookingData.finishedDateTime ? DateUtils.toString( pageData.bookingData.finishedDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
                <br/>
                { ( status === "canceled" ) ? "<light>" : "<dot>" }
                Canceled At: {
                    pageData.bookingData.canceledDateTime ? DateUtils.toString( pageData.bookingData.canceledDateTime, "Mmmm dd, yyyy - hh:mm a.m." )
                    : "-"
                }
            </p>
            <DayPlanner dayPlannerMode="management" pageData={ dayPlannerPageData } show={ false }/>
            {
                (pageData.formIndex === 0) ? <EditServiceTransactions bookingId={ bookingId } pageData={pageData} reloadPageData={reloadPageData} />
                : (pageData.formIndex === 1) ? <EditPayments bookingId={ bookingId } pageData={pageData} reloadPageData={reloadPageData} />
                : <button type="button" onClick={() => { pageData.formIndex--; reloadPageData(); }}>None, Go Back</button>
            }

            <button type="button" onClick={() => console.log(pageData)}>Log page data</button>
        </form>
    </>

    

}

function EditServiceTransactions( { bookingId, pageData, reloadPageData }: {
    bookingId: documentId | undefined,
    pageData: EmployeeBookingManagementPageData,
    reloadPageData: () => void
} ): JSX.Element {

    async function checkFormValidity(): Promise< boolean > {

        return true;

    }

    async function handleChangeClientActive( clientId: string ): Promise< void > {

        pageData.clientIdActive = clientId;
        reloadPageData();

    }

    async function nextPage(): Promise<void> {

        const { canceledDateTime, finishedDateTime } = pageData.bookingData;
        if( canceledDateTime || !finishedDateTime ) return;
        await updateBooking();
        pageData.formIndex++;
        reloadPageData();

    }

    function setActiveBooking(): void {

        if( !bookingId ) return;
        const
            { clientInfoMap, bookingData, bookingDefaultData, updateMap } = pageData,
            dateList: Date[] = []
        ;
        for( let clientId in clientInfoMap ) {

            const { serviceTransactionDataMap } = clientInfoMap[ clientId ];
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const {
                    actualBookingDateTimeStart
                } = serviceTransactionDataMap[ serviceTransactionId ];
                if( !actualBookingDateTimeStart ) continue;
                dateList.push( actualBookingDateTimeStart );

            }

        }
        const minimum: Date | null = DateUtils.getMinimum( dateList ) || null;
        bookingData.activeDateTime = minimum;
        const
            dateDefault = bookingDefaultData.activeDateTime,
            isDefault: boolean = ( dateDefault && minimum ) ? DateUtils.areSameByMinute(
                dateDefault, minimum
            ) : !minimum,
            hasUpdateRecord: boolean = ( bookingId in updateMap )
        ;
        if( !isDefault ) {

            if( !hasUpdateRecord ) updateMap[ bookingId ] = {};
            updateMap[ bookingId ].activeDateTime = true;

        } else if( hasUpdateRecord ) {

            delete updateMap[ bookingId ].activeDateTime;
            if( !ObjectUtils.hasKeys( updateMap[ bookingId ] ) ) delete updateMap[ bookingId ];

        }

    }

    function setFinishedBooking(): void {

        if( !bookingId ) return;
        const
            { clientInfoMap, bookingData, bookingDefaultData, updateMap } = pageData,
            dateList: Date[] = []
        ;
        let
            isFinished: boolean = true,
            maximum: Date | null = null
        ;
        for( let clientId in clientInfoMap ) {

            const { serviceTransactionDataMap } = clientInfoMap[ clientId ];
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                const { actualBookingDateTimeEnd } = serviceTransactionDataMap[ serviceTransactionId ];
                if( !actualBookingDateTimeEnd ) {

                    isFinished = false;
                    break;

                }
                dateList.push( actualBookingDateTimeEnd );

            }
            if( !isFinished ) break;

        }
        maximum = isFinished ? ( DateUtils.getMaximum( dateList ) || null ) : null;
        bookingData.finishedDateTime = maximum;
        const
            dateDefault = bookingDefaultData.finishedDateTime,
            isDefault: boolean = ( dateDefault && maximum ) ? DateUtils.areSameByMinute(
                dateDefault, maximum
            ) : !maximum,
            hasUpdateRecord: boolean = ( bookingId in updateMap )
        ;
        if( !isDefault ) {

            if( !hasUpdateRecord ) updateMap[ bookingId ] = {};
            updateMap[ bookingId ].finishedDateTime = true;

        } else if( hasUpdateRecord ) {

            delete updateMap[ bookingId ].finishedDateTime;
            if( !ObjectUtils.hasKeys( updateMap[ bookingId ] ) ) delete updateMap[ bookingId ];

        }

    }

    async function updateBooking(): Promise< void > {

        pageData.loaded = false;
        reloadPageData();
        if( !( await checkFormValidity() ) ) return;
        const { bookingData, updateMap } = pageData;
        if( bookingId && bookingId in updateMap) {

            await BookingUtils.updateBooking( bookingId, bookingData );
            pageData.bookingDefaultData = { ...bookingData };
            delete updateMap[ bookingId ];

        }
        await updateClientList();
        pageData.loaded = true;
        reloadPageData();

    }

    async function updateClientList(): Promise< void > {

        const {
            clientDataMap, clientDefaultDataMap, clientInfoMap, serviceTransactionDefaultDataMap,
            updateMap
        } = pageData;

        for( let clientId in clientInfoMap ) {

            const
                clientData = clientDataMap[ clientId ],
                { serviceTransactionDataMap } = clientInfoMap[ clientId ]
            ;
            if( clientId in updateMap ) {

                await ClientUtils.updateClient( clientId, clientData );
                clientDefaultDataMap[ clientId ] = { ...clientData };
                delete updateMap[ clientId ];

            }
            for( let serviceTransactionId in serviceTransactionDataMap ) {

                if( !( serviceTransactionId in updateMap ) ) continue;
                const serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ];
                await ServiceTransactionUtils.updateServiceTransaction(
                    serviceTransactionId, serviceTransactionData
                );
                serviceTransactionDefaultDataMap[ serviceTransactionId ] = {
                    ...serviceTransactionData
                };
                delete updateMap[ clientId ];

            }


        }

    }

    return <main className="employee-booking-management-main-content">
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
            pageData.clientIdActive ? Object.keys( pageData.clientInfoMap[ pageData.clientIdActive ].serviceTransactionDataMap ).map( serviceTransactionId => {

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
                    { serviceTransactionDataMap } = clientInfoMap[ clientIdActive ],
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    {
                        service: { id: serviceId },
                        actualBookingDateTimeEnd, actualBookingDateTimeStart,
                        bookingDateTimeEnd, bookingDateTimeStart, employee
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
                        ( serviceTransactionData.status === "canceled" ) ? "canceled"
                        : actualBookingDateTimeEnd ? "finished"
                        : actualBookingDateTimeStart ? "active"
                        : "pending"
                    ),
                    canceled = ( status === "canceled" )
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
                        onChange={ () => { setActiveBooking(); reloadPageData() } }
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
                        onChange={ () => { setFinishedBooking(); reloadPageData() } }
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
                        : <FormMarkButton< serviceTransactionStatus >
                            confirmMessage="Would you like to cancel this service transaction?"
                            documentData={ serviceTransactionData }
                            documentDefaultData={ serviceTransactionDefaultData }
                            documentId={ serviceTransactionId }
                            keyName="status"
                            noText="Back"
                            pageData={ pageData }
                            value={ "canceled" }
                            reloadPageData={ reloadPageData }
                            yesText="Yes, Cancel This"
                        >CANCEL</FormMarkButton>
                    }
                </div>;

            } )
            : undefined
        }</section>
        <button type="button">Cancel All</button>
        <button type="button" onClick={ updateBooking }>Save</button>
        <button type="button" onClick={ nextPage }>Proceed to Payment</button>
        <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
    </main>

}

function EditPayments( { bookingId, pageData, reloadPageData }: {
    bookingId: documentId | undefined,
    pageData: EmployeeBookingManagementPageData,
    reloadPageData: () => void
} ): JSX.Element {

    async function addVoucher(): Promise<void> {
    
        const
            { voucherTransactionDataMap, voucherTransactionIndex } = pageData,
            voucherTransactionId: string = getVoucherTransactionId(voucherTransactionIndex)
        ;
        voucherTransactionDataMap[voucherTransactionId] = {
            voucher: null as unknown as DocumentReference,
            booking: null as unknown as DocumentReference,
            status: "pending"
        };
        pageData.voucherTransactionIndex++;
        reloadPageData();

    }

    async function checkFormValidity(): Promise< boolean > {

        return true;

    }

    function deleteVoucherTransaction(voucherTransactionId: string): void {

        delete pageData.voucherTransactionDataMap[voucherTransactionId];
        reloadPageData();

    }

    async function nextPage(): Promise<void> {

        const { canceledDateTime, finishedDateTime } = pageData.bookingData;
        if( canceledDateTime || !finishedDateTime ) return;
        await updateBooking();
        pageData.formIndex++;
        reloadPageData();

    }

    async function updateBooking(): Promise< void > {

        pageData.loaded = false;
        reloadPageData();
        if( !( await checkFormValidity() ) ) return;
        const { bookingData, updateMap } = pageData;
        if( bookingId && bookingId in updateMap) {

            await BookingUtils.updateBooking( bookingId, bookingData );
            pageData.bookingDefaultData = { ...bookingData };
            delete updateMap[ bookingId ];

        }
        pageData.loaded = true;
        reloadPageData();

    }

    return <main className="employee-booking-management-main-content">
        <BookingReceipt bookingReceiptMode="management" pageData={ pageData } showActualTime={ true } addVoucher={ addVoucher } deleteVoucherTransaction={ deleteVoucherTransaction } reloadPageData={ reloadPageData }/>
        <button type="button" onClick={ updateBooking }>Save</button>
        <button type="button" onClick={ nextPage }>Finish</button>
        <button type="button" onClick={ () => console.log( pageData ) }>Log page data</button>
    </main>

}

export function getVoucherTransactionId(voucherIndex: number): string {

    return `vt${voucherIndex}`;

}
