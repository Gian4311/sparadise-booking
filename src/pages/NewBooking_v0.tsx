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
    SpaRadisePageData,
    VoucherData,
    VoucherDataMap,
    VoucherPackageDataMap,
    VoucherServiceDataMap,
    VoucherTransactionData,
    VoucherTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import "../styles/ClientIndex.css";
import "../styles/ClientBookingCreation.css";
import AccountUtils from "../firebase/AccountUtils";
import BookingCalendar from "../utils/BookingCalendar";
import BookingReceipt from "../components/BookingReceipt";
import BookingUtils from "../firebase/BookingUtils";
import Bullet from "../components/Bullet";
import DateUtils from "../utils/DateUtils";
import { DocumentReference } from "firebase/firestore/lite";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeUtils from "../firebase/EmployeeUtils";
import FormDateInput from "../components/FormDateInput";
import {
    FormEvent,
    Fragment,
    useEffect,
    useState
} from "react";
import FormTextArea from "../components/FormTextArea";
import FormTinyTextInput from "../components/FormTinyTextInput";
import FormVoucherInput from "../components/FormVoucherInput";
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
import {
    useNavigate,
    useParams
} from "react-router-dom";
import VoucherPackageUtils from "../firebase/VoucherPackageUtils";
import VoucherServiceUtils from "../firebase/VoucherServiceUtils";
import VoucherUtils from "../firebase/VoucherUtils";

import NotificationSymbol from "../images/Notification Symbol.png";
import SpaRadiseLogo from "../images/SpaRadise Logo.png"
import "../styles/ClientBookingCreation2.css";
import "../styles/ClientBookingCreation.css";
import NavBar from "../components/ClientNavBar";
import LoadingScreen from "../components/LoadingScreen";
import "../styles/NewBooking_v0.css"
import DateRange from "../utils/DateRange";

export interface NewBookingPageData extends SpaRadisePageData {

    accountData: AccountData,
    bookingCalendar: BookingCalendar,
    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    clientIndex: number,
    clientIndexActive: number,
    clientInfoMap: {
        [clientIndex: number]: {
            packageIncludedMap: { [packageId: documentId]: boolean },
            serviceIncludedMap: { [serviceId: documentId]: documentId },
            serviceTransactionDataMap: { [serviceTransactionId: string]: ServiceTransactionData },
            serviceTransactionIndex: number,
            showPackages: boolean,
            showServices: boolean,
            singleServiceIncludedMap: { [serviceId: documentId]: boolean }
        }
    },
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
        [ packageId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    serviceDataMap: ServiceDataMap,
    serviceTransactionOfDayDataMap: ServiceTransactionDataMap,
    voucherDataMap: VoucherDataMap,
    voucherDataOfDayMap: VoucherDataMap,
    voucherIndex: number,
    voucherPackageKeyMap: {
        [ voucherId: documentId ]: { [ packageId: documentId ]: documentId }
    },
    voucherPackageMap: VoucherPackageDataMap,
    voucherServiceKeyMap: {
        [ voucherId: documentId ]: { [ serviceId: documentId ]: documentId }
    },
    voucherServiceMap: VoucherServiceDataMap,
    voucherTransactionDataMap: VoucherTransactionDataMap
}

export default function NewBooking(): JSX.Element {

    const
        [pageData, setPageData] = useState<NewBookingPageData>({
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
            date: DateUtils.toFloorByDay(DateUtils.addTime(new Date(), { day: 14 })),
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
            updateMap: {},
            voucherDataMap: {},
            voucherDataOfDayMap: {},
            voucherIndex: 0,
            voucherPackageKeyMap: {},
            voucherPackageMap: {},
            voucherServiceMap: {},
            voucherServiceKeyMap: {},
            voucherTransactionDataMap: {}
        }),
        accountId: string | undefined = useParams().accountId
    ;

    function addFormIndex(value: number = 1): void {

        pageData.formIndex += value;
        reloadPageData();

    }

    async function createBooking(): Promise<void> {



    }

    async function checkFormValidity(): Promise<boolean> {

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

    async function handleChangeDate(): Promise<void> {

        await loadMaintenanceData();
        const { date } = pageData;
        await loadEmployeeData();
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay(date)
        ;
        await loadVoucherDataOfDayData();
        await loadBookingCalendar();

    }

    async function loadBookingCalendar(): Promise<void> {

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
        pageData.bookingCalendar = new BookingCalendar(bookingCalendarPageData);

    }

    async function loadEmployeeData(): Promise<void> {

        const { date } = pageData;
        pageData.employeeDataMap = await EmployeeUtils.getActiveEmployeeDataMap(date);
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay(date)
            ;

    }

    async function loadFirstClient(): Promise<void> {

        const { accountData, accountData: { birthDate } } = pageData;
        pageData.clientDataMap[-1] = {
            booking: null as unknown as DocumentReference,
            name: PersonUtils.format(accountData, "f mi l"),
            birthDate,
            notes: null
        };
        pageData.clientInfoMap[-1] = {
            packageIncludedMap: {},
            serviceIncludedMap: {},
            serviceTransactionDataMap: {},
            serviceTransactionIndex: 0,
            showPackages: true,
            showServices: false,
            singleServiceIncludedMap: {}
        };

    }

    async function loadJobData(): Promise<void> {

        pageData.jobDataMap = await JobUtils.getJobDataMapAll();
        pageData.jobServiceDataMap = await JobServiceUtils.getJobServiceDataMapAll();

    }

    async function loadMaintenanceData(): Promise<void> {

        const
            { date } = pageData,
            packageMaintenanceDataMap =
                await PackageMaintenanceUtils.getPackageMaintenanceDataMapByDate(date)
            ,
            serviceMaintenanceDataMap =
                await ServiceMaintenanceUtils.getServiceMaintenanceDataMapByDate(date)
        ;
        pageData.maintenanceDataMap = { ...packageMaintenanceDataMap, ...serviceMaintenanceDataMap };

    }

    async function loadPageData(): Promise<void> {

        if (!accountId) return;
        pageData.accountData = await AccountUtils.getAccountData(accountId);
        pageData.bookingData.account = SpaRadiseFirestore.getDocumentReference(
            accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        await loadFirstClient();
        await loadServiceData();
        await loadJobData();
        await loadVoucherData();
        pageData.loaded = true;
        await handleChangeDate();
        reloadPageData();

    }

    async function loadServiceData(): Promise<void> {

        pageData.serviceDataMap = await ServiceUtils.getServiceDataMapAll();
        pageData.packageDataMap = await PackageUtils.getPackageDataMapAll();
        pageData.packageServiceDataMap = await PackageServiceUtils.getPackageServiceDataMapAll();
        const { packageDataMap, packageServiceDataMap, packageServiceKeyMap } = pageData;
        for (let packageId in packageDataMap) packageServiceKeyMap[packageId] = {};
        for (let packageServiceId in packageServiceDataMap) {

            const {
                package: { id: packageId }, service: { id: serviceId }
            } = packageServiceDataMap[ packageServiceId ];
            packageServiceKeyMap[ packageId ][ serviceId ] = packageServiceId;

        }

    }

    async function loadVoucherDataOfDayData(): Promise< void > {

        pageData.voucherDataOfDayMap = {};
        const
            { date, voucherDataMap, voucherDataOfDayMap } = pageData,
            dateTimeStart: Date = DateUtils.toFloorByDay( date ),
            dateTimeEnd: Date = DateUtils.toCeilByDay( date ),
            dateRange: DateRange = new DateRange( dateTimeStart, dateTimeEnd )
        ;
        for( let voucherId in voucherDataMap ) {

            const
                voucherData = voucherDataMap[ voucherId ],
                { dateValid, dateExpiry } = voucherData,
                dateRangeCompare: DateRange = new DateRange( dateValid, dateExpiry )
            ;
            if( dateRange.overlapsWith( dateRangeCompare ) )
                voucherDataOfDayMap[ voucherId ] = voucherData;

        }
    }

    async function loadVoucherData(): Promise< void > {

        const
            { voucherPackageKeyMap, voucherServiceKeyMap } = pageData,
            voucherDataMap = await VoucherUtils.getVoucherDataMapAll(),
            voucherPackageDataMap = await VoucherPackageUtils.getVoucherPackageDataMapAll(),
            voucherServiceDataMap = await VoucherServiceUtils.getVoucherServiceDataMapAll()
        ;
        pageData.voucherDataMap = voucherDataMap;
        pageData.voucherPackageMap = voucherPackageDataMap;
        pageData.voucherServiceMap = voucherServiceDataMap;
        for( let voucherId in voucherDataMap ) {

            voucherPackageKeyMap[ voucherId ] = {};
            voucherServiceKeyMap[ voucherId ] = {};

        }
        for( let voucherPackageId in voucherPackageDataMap ) {

            const {
                voucher: { id: voucherId }, package: { id: packageId }
            } = voucherPackageDataMap[ voucherPackageId ];
            voucherPackageKeyMap[ voucherId ][ packageId ] = voucherPackageId;

        }
        for( let voucherServiceId in voucherServiceDataMap ) {

            const {
                voucher: { id: voucherId }, service: { id: serviceId }
            } = voucherServiceDataMap[ voucherServiceId ];
            voucherServiceKeyMap[ voucherId ][ serviceId ] = voucherServiceId;

        }
        
    }

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        await createBooking();

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        {/* <EmployeeSidebar/> */}
        <form onSubmit={submit}>
            {
                (pageData.formIndex === 0) ? <ChooseClients pageData={pageData} reloadPageData={reloadPageData} />
                : (pageData.formIndex === 1) ? <ChooseServices pageData={pageData} handleChangeDate={ handleChangeDate } reloadPageData={reloadPageData} />
                : (pageData.formIndex === 2) ? <ChooseTimeSlots pageData={pageData} reloadPageData={reloadPageData} />
                : (pageData.formIndex === 3) ? <Summary pageData={pageData} reloadPageData={reloadPageData} />
                // other form indexes
                : <button type="button" onClick={() => { pageData.formIndex--; reloadPageData(); }}>None, Go Back</button>
            }

            <button type="button" onClick={() => console.log(pageData)}>Log page data</button>
        </form>
    </>

}

function ChooseClients({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const
        { clientDataMap, clientInfoMap } = pageData,
        clientLength: number = ObjectUtils.keyLength(clientDataMap),
        navigate = useNavigate()
    ;

    async function addClient(): Promise<void> {

        const { clientDataMap, clientIndex } = pageData;
        clientDataMap[clientIndex] = {
            booking: null as unknown as DocumentReference,
            name: null as unknown as string,
            birthDate: null as unknown as Date,
            notes: null
        };
        clientInfoMap[clientIndex] = {
            packageIncludedMap: {},
            serviceIncludedMap: {},
            serviceTransactionDataMap: {},
            serviceTransactionIndex: 0,
            showPackages: true,
            showServices: false,
            singleServiceIncludedMap: {}
        };
        pageData.clientIndex++;
        reloadPageData();

    }

    async function checkFormValidity(): Promise<boolean> {

        const
            { MIN_AGE_LIMIT } = SpaRadiseEnv,
            { clientDataMap } = pageData
            ;
        if (!ObjectUtils.hasKeys(clientDataMap))
            throw new Error(`There must be at least 1 client!`);
        for (let clientId in clientDataMap) {

            const { name, birthDate } = clientDataMap[clientId];
            if (!name) throw new Error(`Client names cannot be empty!`);
            // check for duplicate names
            if (!birthDate) throw new Error(`Birth dates cannot be empty!`);
            if (DateUtils.getYearAge(birthDate) < MIN_AGE_LIMIT)
                throw new Error(`The age limit is ${MIN_AGE_LIMIT} years old!`);

        }
        return true;

    }

    async function deleteClient(clientIndex: number): Promise<void> {

        delete clientDataMap[clientIndex];
        delete clientInfoMap[clientIndex];
        reloadPageData();

    }

    function loadClientIndexActive(): void {

        let minimum: number = Infinity;
        for (let keyName in clientDataMap) {

            const index = +keyName;
            if (index < minimum) minimum = index;

        }
        pageData.clientIndexActive = minimum;

    }

    async function nextPage(): Promise<void> {

        await checkFormValidity();
        pageData.formIndex++;
        loadClientIndexActive();
        reloadPageData();

    }

    async function previousPage(): Promise<void> {

        navigate( "/" );

    }

    return <>
        <LoadingScreen loading={ !pageData.loaded }></LoadingScreen>
        <NavBar></NavBar>
        <main className="booking-container">
            <section className="booking-form">
                <h1 className="booking-title">Who are the Clients?</h1>
                {
                    Object.keys(clientDataMap).sort().map(clientIndex => {
                        const clientData: ClientData = clientDataMap[clientIndex];
                        return (
                            <div className="client-row" key={clientIndex}>
                                <div className="client-input">
                                    <label className="form-row-label" >Name</label>
                                    <FormTinyTextInput documentData={clientData} keyName="name" pageData={pageData} required={true} />
                                </div>
                                <div className="client-input">
                                    <label className="form-row-label" >Birth Date</label>
                                    <FormDateInput documentData={clientData} keyName="birthDate" pageData={pageData} required={true} />
                                </div>
                                {
                                    (clientLength > 1) ?
                                        <button className="client-booking-delete-btn" type="button" onClick={() => deleteClient(+clientIndex)}>Delete</button>
                                        : <></>
                                }
                            </div>
                        );
                    })
                }
                <button className="add-client-btn" type="button" onClick={addClient}>Add Another Client +</button>
                <div className="action-buttons">
                    <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                    <button className="proceed-btn" type="button" onClick={nextPage}>Proceed (1/4)</button>
                </div>
            </section>
        </main>
    </>;

}

function ChooseServices({ pageData, handleChangeDate, reloadPageData }: {
    pageData: NewBookingPageData,
    handleChangeDate: () => Promise< void >,
    reloadPageData: () => void
}): JSX.Element {

    const
        {
            clientDataMap, clientIndexActive, clientInfoMap, maintenanceDataMap, packageDataMap,
            packageServiceKeyMap, serviceDataMap
        } = pageData,
        {
            packageIncludedMap, serviceIncludedMap, serviceTransactionDataMap, singleServiceIncludedMap,
            showPackages, showServices
        } = clientInfoMap[clientIndexActive]
        ;

    async function addPackage(packageId: documentId): Promise<void> {

        if( isConflictingPackage( packageId ) ) return;
        for( let serviceId in packageServiceKeyMap[ packageId ] )
            await addServiceTransaction( serviceId, packageId );
        packageIncludedMap[ packageId ] = true;
        reloadPageData();

    }

    async function addServiceTransaction(
        serviceId: documentId, packageId?: documentId
    ): Promise< void > {
        
        if( pageData.maintenanceDataMap[ serviceId ].status === "inactive" ) return;
        const
            { serviceTransactionIndex } = clientInfoMap[clientIndexActive],
            serviceTransactionId: string = getServiceTransactionId(
                clientIndexActive, serviceTransactionIndex
            )
            ;
        serviceTransactionDataMap[serviceTransactionId] = {
            client: null as unknown as DocumentReference,
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            ),
            package: packageId ? SpaRadiseFirestore.getDocumentReference(
                packageId, SpaRadiseEnv.PACKAGE_COLLECTION
            ) : null,
            canceled: false,
            free: false,
            bookingDateTimeStart: null as unknown as Date,
            bookingDateTimeEnd: null as unknown as Date,
            actualBookingDateTimeStart: null,
            actualBookingDateTimeEnd: null,
            employee: null,
            notes: null
        };
        serviceIncludedMap[serviceId] = getServiceTransactionId(
            clientIndexActive, serviceTransactionIndex
        );
        clientInfoMap[clientIndexActive].serviceTransactionIndex++;

    }

    async function addSingleService(serviceId: documentId): Promise<void> {

        if (isConflictingService(serviceId)) return;
        await addServiceTransaction(serviceId);
        singleServiceIncludedMap[serviceId] = true;
        reloadPageData();

    }

    async function checkFormValidity(): Promise<boolean> {

        const
            { MIN_AGE_LIMIT } = SpaRadiseEnv,
            { clientDataMap, date } = pageData
            ;
        if (!date)
            throw new Error("No booking date given! ");
        const isSunday: boolean = (date.getDay() === 0);
        if (isSunday)
            throw new Error("Booking date cannot be on a Sunday!");
        for (let clientId in clientDataMap) {

            const { name, birthDate } = clientDataMap[clientId];
            if (!name) throw new Error(`Client names cannot be empty!`);
            // check for duplicate names
            if (!birthDate) throw new Error(`Birth dates cannot be empty!`);
            if (DateUtils.getYearAge(birthDate) < MIN_AGE_LIMIT)
                throw new Error(`The age limit is ${MIN_AGE_LIMIT} years old!`);

        }
        return true;

    }

    async function deletePackage(packageId: documentId): Promise<void> {

        for( let serviceId in packageServiceKeyMap[ packageId ] )
            await deleteServiceTransaction( serviceId );
        delete packageIncludedMap[ packageId ];
        reloadPageData();

    }

    async function deleteServiceTransaction(serviceId: documentId): Promise<void> {

        const serviceTransactionIndex = serviceIncludedMap[serviceId];
        delete serviceTransactionDataMap[serviceTransactionIndex];
        delete serviceIncludedMap[serviceId];

    }

    async function deleteSingleService(serviceId: documentId): Promise<void> {

        await deleteServiceTransaction(serviceId);
        delete singleServiceIncludedMap[serviceId];
        reloadPageData();

    }

    async function handleChangeClientActive(clientIndex: number): Promise<void> {

        pageData.clientIndexActive = clientIndex;
        reloadPageData();

    }

    function isConflictingPackage(packageId: documentId): boolean {

        for( let serviceId in packageServiceKeyMap[ packageId ] )
            if( isConflictingService( serviceId ) ) return true;
        return false;

    }

    function isConflictingService(serviceId: documentId): boolean {

        return serviceId in serviceIncludedMap;

    }

    async function nextPage(): Promise<void> {

        await checkFormValidity();
        pageData.formIndex++;
        reloadPageData();

    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    function togglePackages(): void {

        clientInfoMap[clientIndexActive].showPackages =
            !clientInfoMap[clientIndexActive].showPackages
            ;
        reloadPageData();

    }

    function toggleServices(): void {

        clientInfoMap[clientIndexActive].showServices =
            !clientInfoMap[clientIndexActive].showServices
            ;
        reloadPageData();

    }

    return <>
        <LoadingScreen loading={ !pageData.loaded }></LoadingScreen>
        <NavBar></NavBar>
        <main className="booking-container">
            <section className="form-section client-date-section">
                <div className="date-input">
                    <label className="input-label">Choose date</label>
                    <NewBookingDateInput pageData={pageData} onChange={handleChangeDate} reloadPageData={reloadPageData} />
                </div>
            </section>
            <div className="client-input">
                <label className="client-selection">Select Client:</label>
                <div className="clickable-bars" id="client-selection">
                    {
                        Object.keys(clientDataMap).sort().map(clientIndex =>
                            <div
                                key={clientIndex}
                                className={`client-item ${(+clientIndex === clientIndexActive) ? 'active' : ''}`}
                                data-client={`client${clientIndex}`}
                                onClick={() => handleChangeClientActive(+clientIndex)}
                            >
                                {clientDataMap[+clientIndex].name}
                            </div>
                        )
                    }
                </div>
            </div>

            <section className="form-section package-section">
                <div className="section-label">Select Packages:</div>
                <button className="toggle-button" type="button" onClick={togglePackages}>Packages</button>
                <div className={showPackages ? "package-scroll-container" : "hidden"}>
                    {Object.keys(packageDataMap).map(packageId => {
                        const { price, status } = maintenanceDataMap[packageId];
                        if (status === "inactive") return undefined;

                        const { name, description } = packageDataMap[packageId];
                        const serviceKeyMap = packageServiceKeyMap[packageId];
                        const serviceKeyList = Object.keys(serviceKeyMap)
                            .filter(serviceId => maintenanceDataMap[serviceId].status === "active")
                            ;

                        if (serviceKeyList.length <= 1) return undefined;

                        return (
                            <div className="package-scroll-item" key={packageId}>
                                <div className="package-price">₱{price}</div>
                                <div className="package-name">{name}</div>
                                <div className="package-services">
                                    {serviceKeyList.sort((serviceId1, serviceId2) =>
                                        StringUtils.compare(serviceDataMap[serviceId1].name, serviceDataMap[serviceId2].name)
                                    ).map(serviceId => {
                                        const { name } = serviceDataMap[serviceId];
                                        return (
                                            <div className={isConflictingService(serviceId) ? "included" : ""} key={serviceId}>
                                                {name} </div>
                                        );
                                    })}
                                </div>
                                <div className="package-description">{description}</div>
                                {
                                    (packageId in packageIncludedMap) ? (
                                        <button className="remove-btn" type="button" onClick={() => deletePackage(packageId)}>Remove</button>
                                    ) : isConflictingPackage(packageId) ? (
                                        <button className="conf-btn" type="button">In Conflict</button>
                                    ) : (
                                        <button className="add-btn" type="button" onClick={() => addPackage(packageId)}>Add</button>
                                    )
                                }
                            </div>
                        );
                    })}
                </div>
            </section>


            <section className="form-section service-section">
                <div className="section-label">Select Services:</div>
                <button type="button" className="toggle-button" onClick={toggleServices}>Services</button>
                <div className={showServices ? "service-scroll-container" : "hidden"}>
                    {Object.keys(serviceDataMap).map(serviceId => {
                        const { name, description } = serviceDataMap[serviceId];
                        const { price, status } = maintenanceDataMap[serviceId];
                        if (status === "inactive") return undefined;

                        return (
                            <div className="service-scroll-item" key={serviceId}>
                                <div className="service-price">₱{price}</div>
                                <div className="service-name">{name}</div>
                                <div className="service-description">{description}</div>
                                {
                                    (serviceId in singleServiceIncludedMap) ? (
                                        <button className="remove-btn" type="button" onClick={() => deleteSingleService(serviceId)}>Remove</button>
                                    ) : isConflictingService(serviceId) ? (
                                        <button className="conf-btn" type="button">In Conflict</button>
                                    ) : (
                                        <button className="add-btn" type="button" onClick={() => addSingleService(serviceId)}>Add</button>
                                    )
                                }
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="form-section notes-section">
                <label htmlFor="notes" className="input-label">Notes:</label>
                <FormTextArea documentData={clientDataMap[clientIndexActive]} keyName="notes" pageData={pageData} required={true} />
            </section>
            <section className="action-buttons">
                <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                <button className="proceed-btn" type="button" onClick={nextPage}>Proceed (2/4)</button>
            </section>
        </main >
    </>;

}

function ChooseTimeSlots({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const { clientDataMap, clientInfoMap, clientIndexActive, date } = pageData;

    async function checkFormValidity(): Promise<boolean> {

        for (let clientIndex in clientDataMap) {

            const { serviceTransactionDataMap } = clientInfoMap[+clientIndex];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const
                    { bookingDateTimeStart, bookingDateTimeEnd } = serviceTransactionDataMap[
                        serviceTransactionId
                    ]
                    ;
                if (!bookingDateTimeStart)
                    throw new Error(`Booking from date time in ${serviceTransactionId} is undefined.`);
                if (!bookingDateTimeEnd)
                    throw new Error(`Booking to date time in ${serviceTransactionId} is undefined.`);

            }

        }
        return true;

    }

    async function handleChangeClientActive(clientIndex: number): Promise<void> {

        pageData.clientIndexActive = clientIndex;
        reloadPageData();

    }

    async function nextPage(): Promise<void> {

        await checkFormValidity();
        pageData.formIndex++;
        reloadPageData();

    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    return <>
        <LoadingScreen loading={ !pageData.loaded }></LoadingScreen>
        <NavBar></NavBar>
        <main className="booking-container">
            <section className="form-section client-date-section">
                <div className="time-slot-date">{DateUtils.toString(date, "Mmmm dd, yyyy")}</div>
            </section>
            <div className="client-input">
                <label htmlFor="client-selection" className="input-label">Select Client:</label>
                <div id="client-selection" className="clickable-bars">
                    {Object.keys(clientDataMap).sort().map(clientIndex => (
                        <div
                            key={clientIndex}
                            className={`client-item ${+clientIndex === clientIndexActive ? "active" : ""}`}
                            data-client={`client${clientIndex}`}
                            onClick={() => handleChangeClientActive(+clientIndex)}
                        >
                            {clientDataMap[clientIndex].name}
                        </div>
                    ))}
                </div>
            </div>

            <p className="time-slot-note">
                *NOTE: Services marked<Bullet color="#ffc100" size="12px" style={{ margin: "0 5px" }} />
                can be done together with<Bullet color="#6699ff" size="12px" style={{ margin: "0 5px" }} />
                or<Bullet color="#3bba23" size="12px" style={{ margin: "0 5px" }} />.
            </p>
            <table className="time-slot-table">
                <thead><tr>
                    <td></td>
                    <td>Service</td>
                    <td>Time Slot</td>
                    <td>Duration</td>
                </tr></thead>
                <tbody>{
                    Object.keys(pageData.clientInfoMap[clientIndexActive].serviceTransactionDataMap).map(serviceTransactionId => {

                        const
                            serviceTransactionData = pageData
                                .clientInfoMap[clientIndexActive]
                                .serviceTransactionDataMap[serviceTransactionId]
                            ,
                            { service: { id: serviceId } } = serviceTransactionData,
                            { name, serviceType, durationMin } = pageData.serviceDataMap[serviceId]
                            ;
                        return <tr key={serviceTransactionId}>
                            <td>{
                                (serviceType === "handsAndFeet") ? <Bullet color="#ffc100" size="12px" style={{ margin: "0 5px" }} />
                                    : (serviceType === "browsAndLashes") ? <Bullet color="#6699ff" size="12px" style={{ margin: "0 5px" }} />
                                        : (serviceType === "facial") ? <Bullet color="#3bba23" size="12px" style={{ margin: "0 5px" }} />
                                            : <Bullet color="#cd8385" size="12px" style={{ margin: "0 5px" }} />
                            }</td>
                            <td>{name}</td>
                            <td>
                                <ServiceTransactionTimeSlot clientId={clientIndexActive.toString()} documentData={serviceTransactionData} duration={durationMin} keyNameFrom="bookingDateTimeStart" keyNameTo="bookingDateTimeEnd" pageData={pageData} serviceTransactionId={serviceTransactionId} reloadPageData={reloadPageData}>
                                    <option value="" disabled>Select time slot</option>
                                </ServiceTransactionTimeSlot>
                            </td>
                            <td>{durationMin}</td>
                        </tr>;

                    })
                }</tbody>
            </table>
            <section className="action-buttons">
                <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                <button className="proceed-btn" type="button" onClick={nextPage}>Proceed (3/4)</button>
            </section>
        </main>
    </>;

}

function Summary({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const
        { date, voucherDataOfDayMap, voucherTransactionDataMap } = pageData
    ;

    async function addVoucher(): Promise< void > {

        const { voucherIndex } = pageData;
        voucherTransactionDataMap[ voucherIndex ] = {
            voucher: null as unknown as DocumentReference,
            booking: null as unknown as DocumentReference,
            status: "pending"
        };
        pageData.voucherIndex++;
        reloadPageData();

    }

    async function checkFormValidity(): Promise<boolean> {

        return true;

    }

    function handleChangeVoucherCode( voucherTransactionIndex: number, code: string | null ): void {

        const voucherData: VoucherData | null = getVoucherDataByCode( code );
        if( voucherData ) {



        }

    }

    function getVoucherDataByCode( code: string | null ): VoucherData | null {

        if( !code ) return null;
        for( let voucherId in voucherDataOfDayMap ) {

            const voucherData = voucherDataOfDayMap[ voucherId ];
            if( code === voucherData.code ) return voucherData;

        }
        return null; 

    }

    async function nextPage(): Promise<void> {

        pageData.formIndex++;
        reloadPageData();

    }

    async function preprocessVoucherInput( code: string ): Promise< string > {

        code = code.trim();
        return code;

    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    return <>
        <LoadingScreen loading={ !pageData.loaded }></LoadingScreen>
        <NavBar></NavBar>
        <main className="booking-container">
            <section className="form-section booking-summary-section">
                <section className="form-section client-date-section">
                    <div className="time-slot-date">{DateUtils.toString(date, "Mmmm dd, yyyy")}</div>
                </section>
                <h2 className="summary-label">Booking Summary</h2>
                <section className="form-section booking-summary-section">
                    {/* <Receipt pageData={pageData} reloadPageData={reloadPageData} /> */}
                    <BookingReceipt pageData={pageData} />
                </section>
            </section>
            <br></br>
            Voucher/s:
            <div>
                {
                    Object.keys( voucherTransactionDataMap ).map( voucherTransactionIndex => {

                        return <Fragment key={ voucherTransactionIndex }>
                            <FormVoucherInput pageData={ pageData } preprocess={ preprocessVoucherInput } onChange={ code => handleChangeVoucherCode( +voucherTransactionIndex, code ) }/>
                            <br/>
                        </Fragment>;

                    } )
                }
                <button type="button" onClick={ addVoucher }>+ Add Voucher</button>
            </div>
            <section className="action-buttons">
                <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                <button className="proceed-btn" type="button" onClick={nextPage}>Proceed (4/4)</button>
            </section>
        </main>
    </>;

}

function Receipt({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const
        {
            date, clientDataMap, clientInfoMap, maintenanceDataMap, packageDataMap,
            packageServiceKeyMap, serviceDataMap
        } = pageData
        ;
    return (
        <table className="booking-summary-table">
            <thead>
                <tr>
                    <th>Client</th>
                    <th>Service/Package</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                {Object.keys(clientInfoMap).map((clientIndex) => {
                    const clientData = clientDataMap[+clientIndex];
                    const { name } = clientData;
                    const {
                        packageIncludedMap,
                        singleServiceIncludedMap,
                        serviceTransactionDataMap,
                        serviceIncludedMap,
                    } = clientInfoMap[+clientIndex];

                    // Get total rows needed for rowspan
                    const packageKeys = Object.keys(packageIncludedMap);
                    const totalRows = packageKeys.length;

                    return packageKeys.map((packageKey, idx) => {
                        const { name: packageName } = packageDataMap[packageKey];
                        const { price } = maintenanceDataMap[packageKey];

                        return (
                            <tr key={`${clientIndex}-${packageKey}`}>
                                {idx === 0 && (
                                    <td className="client-name-summary" rowSpan={totalRows} style={{ verticalAlign: "top" }}>
                                        {name}
                                    </td>
                                )}
                                <td>
                                    <div className="package-name-summary">{packageName}</div>
                                    {Object.keys(packageServiceKeyMap[packageKey]).map(
                                        serviceId => {
                                            const { name: serviceName } = serviceDataMap[serviceId];
                                            const serviceTransactionId = serviceIncludedMap[serviceId];
                                            if( !serviceTransactionId ) return undefined;
                                            const {
                                                bookingDateTimeStart,
                                                bookingDateTimeEnd,
                                            } = serviceTransactionDataMap[serviceTransactionId];
                                            const dateRange = new DateRange(
                                                bookingDateTimeStart,
                                                bookingDateTimeEnd
                                            );
                                            return (
                                                <div key={serviceId}>
                                                    {'> '}{serviceName} ({dateRange.toString("h:mmAM-h:mmAM")})
                                                </div>
                                            );
                                        }
                                    )}
                                </td>
                                <td>₱{price}</td>
                            </tr>
                        );
                    });
                })}
            </tbody>
        </table>
    );



}

export function getServiceTransactionId(
    clientIndex: number, serviceTransactionIndex: number
): string {

    return `${clientIndex}_${serviceTransactionIndex}`;

}
