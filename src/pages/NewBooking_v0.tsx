import {
    AccountData,
    BookingData,
    BookingDataMap,
    CapacityDataMap,
    ClientData,
    ClientDataMap,
    DiscountDataMap,
    EmployeeDataMap,
    EmployeeLeaveDataMap,
    JobDataMap,
    JobServiceDataMap,
    PackageDataMap,
    PackageMaintenanceData,
    PackageServiceDataMap,
    PaymentDataMap,
    ServiceDataMap,
    ServiceMaintenanceData,
    ServiceTransactionDataMap,
    ServiceTransactionEmployeeListKeyMap,
    SpaRadisePageData,
    VoucherDataMap,
    VoucherPackageDataMap,
    VoucherServiceDataMap,
    VoucherTransactionApplicationMap,
    VoucherTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import "../styles/ClientIndex.css";
import "../styles/ClientBookingCreation.css";
import AccountUtils from "../firebase/AccountUtils";
import BookingReceipt from "../components/BookingReceipt";
import BookingUtils from "../firebase/BookingUtils";
import Bullet from "../components/Bullet";
import ClientUtils from "../firebase/ClientUtils";
import DateUtils from "../utils/DateUtils";
import DayPlanner from "../components/DayPlanner";
import DiscountUtils from "../firebase/DiscountUtils";
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
import BookingDateInput from "../components/BookingDateInput";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PackageMaintenanceUtils from "../firebase/PackageMaintenanceUtils";
import PackageServiceUtils from "../firebase/PackageServiceUtils";
import PackageUtils from "../firebase/PackageUtils";
import PaymentUtils from "../firebase/PaymentUtils";
import PersonUtils from "../utils/PersonUtils";
import PopupModal from "../components/PopupModal";
import ServiceMaintenanceUtils from "../firebase/ServiceMaintenanceUtils";
import ServiceTransactionUtils from "../firebase/ServiceTransactionUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import SpaRadiseDataMapUtils from "../firebase/SpaRadiseDataMapUtils";
import SpaRadiseEnv from "../firebase/SpaRadiseEnv";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import StringUtils from "../utils/StringUtils";
import {
    useNavigate,
    useParams
} from "react-router-dom";
import VoucherPackageUtils from "../firebase/VoucherPackageUtils";
import VoucherServiceUtils from "../firebase/VoucherServiceUtils";
import VoucherTransactionUtils from "../firebase/VoucherTransactionUtils";
import VoucherUtils from "../firebase/VoucherUtils";

import NotificationSymbol from "../images/Notification Symbol.png";
import SpaRadiseLogo from "../images/SpaRadise Logo.png"
import "../styles/ClientBookingCreation2.css";
import "../styles/ClientBookingCreation.css";
import NavBar from "../components/ClientNavBar";
import LoadingScreen from "../components/LoadingScreen";
import "../styles/NewBooking_v0.css"
import DateRange from "../utils/DateRange";
import NewBookingEmailInput from "../components/NewBookingEmailInput";
import CapacityUtils from "../firebase/CapacityUtils";

export interface NewBookingPageData extends SpaRadisePageData {

    accountData: AccountData,
    bookingData: BookingData,
    bookingDefaultData: BookingData,
    bookingDocumentReference?: DocumentReference,
    capacityDataMap: CapacityDataMap,
    clientDataMap: ClientDataMap,
    clientDefaultDataMap: ClientDataMap,
    clientIndex: number,
    clientIdActive: string,
    clientInfoMap: {
        [clientId: string]: {
            packageIncludedMap: { [packageId: documentId]: boolean },
            packageServiceTransactionDataMap: { [packageId: documentId]: ServiceTransactionDataMap },
            packageVoucherTransactionKeyMap: { [packageId: documentId]: documentId | undefined },
            serviceIncludedMap: { [serviceId: documentId]: documentId },
            serviceServiceTransactionKeyMap: { [serviceId: documentId]: documentId },
            serviceTransactionDataMap: ServiceTransactionDataMap,
            serviceTransactionIndex: number,
            showPackages: boolean,
            showServices: boolean,
            singleServiceIncludedMap: { [serviceId: documentId]: boolean },
            singleServiceVoucherTransactionKeyMap: { [serviceId: documentId]: documentId | undefined }
        }
    },
    customerInOrder?: AccountData,
    date: Date,
    discountDataMap: DiscountDataMap,
    discountDefaultDataMap: DiscountDataMap,
    discountIndex: number,
    discountTotal: number,
    employeeDataMap: EmployeeDataMap,
    employeeLeaveOfDayDataMap: EmployeeLeaveDataMap,
    formIndex: number,
    jobDataMap: JobDataMap,
    jobServiceDataMap: JobServiceDataMap,
    maintenanceDataMap: { [documentId: documentId]: PackageMaintenanceData | ServiceMaintenanceData },
    initialPrice: number,
    packageDataMap: PackageDataMap,
    packageServiceDataMap: PackageServiceDataMap,
    packageServiceKeyMap: {
        [packageId: documentId]: { [serviceId: documentId]: documentId }
    },
    paymentDataMap: PaymentDataMap,
    paymentDefaultDataMap: PaymentDataMap,
    paymentIndex: number,
    paymentTotal: number,
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

export default function NewBooking(): JSX.Element {

    const
        currentDate: Date = DateUtils.toFloorByDay(new Date()),
        [pageData, setPageData] = useState<NewBookingPageData>({
            accountData: {} as AccountData,
            bookingDefaultData: {} as BookingData,
            bookingData: {
                account: null as unknown as DocumentReference,
                reservedDateTime: null as unknown as Date,
                activeDateTime: null,
                finishedDateTime: null,
                canceledDateTime: null
            },
            capacityDataMap: {},
            clientDataMap: {},
            clientDefaultDataMap: {},
            clientIndex: 0,
            clientIdActive: null as unknown as string,
            clientInfoMap: {},
            date: DateUtils.addTime(
                currentDate,
                { day: 14 + (DateUtils.isSunday(currentDate) ? 1 : 0) }
            ),
            discountDataMap: {},
            discountDefaultDataMap: {},
            discountIndex: 0,
            discountTotal: 0,
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
            paymentDataMap: {},
            paymentDefaultDataMap: {},
            paymentIndex: 0,
            paymentTotal: 0,
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
        }),
        accountId: string | undefined = useParams().accountId,
        bookingId: string | undefined = useParams().bookingId,
        isNewMode: boolean = (bookingId === "new"),
        isEditMode: boolean = (bookingId !== undefined && !isNewMode),
        navigate = useNavigate()
        ;

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

    async function createBooking(): Promise<void> {

        if (!isNewMode || !bookingId || !accountId) return;
        await checkFormValidity();
        pageData.bookingData.reservedDateTime = new Date();

        const { customerInOrder } = pageData;
        if( !customerInOrder )
            pageData.bookingData.account = SpaRadiseFirestore.getDocumentReference(
                accountId, SpaRadiseEnv.ACCOUNT_COLLECTION
            );
        else {

            const
                { email } = customerInOrder,
                accountDataMap = await AccountUtils.getAccountDataByEmail( email )
            ;
            let accountData: AccountData | undefined = undefined;
            for( let accountId in accountDataMap ) accountData = accountDataMap[ accountId ];
            if( !accountData )
                pageData.bookingData.account = await AccountUtils.createAccount( customerInOrder );

        }
        const documentReference: DocumentReference = await BookingUtils.createBooking(
            pageData.bookingData
        );
        pageData.bookingDocumentReference = documentReference;
        await updateClientList();
        await updateServiceTransactionList();
        await updateVoucherTransactionList();
        delete pageData.updateMap["new"];
        pageData.popupData = {
            children: `Booking reserved!`,
            popupMode: "yesOnly",
            yes: () => navigate(`/`)
        };
        reloadPageData();

    }

    async function createClientList(): Promise<void> {

        const
            { bookingDocumentReference, clientDataMap, clientInfoMap, clientDefaultDataMap } = pageData
            ;
        if (!bookingDocumentReference) return;
        for (let clientId in clientDataMap) {

            const isNew: boolean = !(clientId in clientDefaultDataMap);
            if (!isNew) continue;
            const clientData = clientDataMap[clientId];
            clientData.booking = bookingDocumentReference;
            const
                clientDocumentReference =
                    await ClientUtils.createClient(clientData)
                ,
                clientIdNew: string = clientDocumentReference.id,
                clientInfo = clientInfoMap[clientId]
                ;
            delete clientDataMap[clientId];
            delete clientInfoMap[clientId];
            clientDataMap[clientIdNew] = clientData;
            clientInfoMap[clientIdNew] = clientInfo;

        }
        pageData.clientDefaultDataMap = SpaRadiseDataMapUtils.clone(clientDataMap);

    }

    async function createServiceTransactionList(): Promise<void> {

        const
            { bookingDocumentReference, clientInfoMap, serviceTransactionDefaultDataMap } = pageData
            ;
        if (!bookingDocumentReference) return;
        for (let clientId in clientInfoMap) {

            const { serviceTransactionDataMap } = clientInfoMap[clientId];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const isNew: boolean = !(serviceTransactionId in serviceTransactionDefaultDataMap);
                if (!isNew) continue;
                const serviceTransactionData = serviceTransactionDataMap[serviceTransactionId];
                serviceTransactionData.client = SpaRadiseFirestore.getDocumentReference(
                    clientId, SpaRadiseEnv.CLIENT_COLLECTION
                );
                const
                    serviceTransactionDocumentReference =
                        await ServiceTransactionUtils.createServiceTransaction(
                            serviceTransactionData
                        )
                    ,
                    serviceTransactionIdNew: string = serviceTransactionDocumentReference.id
                    ;
                delete serviceTransactionDataMap[serviceTransactionId];
                serviceTransactionDataMap[serviceTransactionIdNew] = serviceTransactionData;
                serviceTransactionDefaultDataMap[serviceTransactionIdNew] =
                    serviceTransactionData
                    ;

            }

        }

    }

    async function createVoucherTransactionList(): Promise<void> {

        const {
            bookingDocumentReference, voucherTransactionDataMap,
            voucherTransactionDefaultDataMap
        } = pageData;
        if (!bookingDocumentReference) return;
        for (let voucherTransactionId in voucherTransactionDefaultDataMap) {

            const isNew: boolean = !(voucherTransactionId in voucherTransactionDefaultDataMap);
            if (!isNew) continue;
            const voucherTransactionData = voucherTransactionDataMap[voucherTransactionId];
            if (!voucherTransactionData.voucher) {

                delete voucherTransactionDataMap[voucherTransactionId];
                continue;

            };
            voucherTransactionData.booking = bookingDocumentReference;
            const
                voucherTransactionDocumentReference =
                    await VoucherTransactionUtils.createVoucherTransaction(voucherTransactionData)
                ,
                voucherTransactionIdNew: string = voucherTransactionDocumentReference.id
                ;
            delete voucherTransactionDataMap[voucherTransactionId];
            voucherTransactionDataMap[voucherTransactionIdNew] = voucherTransactionData;

        }
        pageData.voucherTransactionDefaultDataMap = SpaRadiseDataMapUtils.clone(
            voucherTransactionDataMap
        );

    }

    async function handleChangeDate(): Promise<void> {

        await loadMaintenanceData();
        const { clientDefaultDataMap, date } = pageData;
        await loadEmployeeData();
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay(
                date, true, clientDefaultDataMap
            )
            ;
        await loadVoucherDataOfDayData();
        pageData.capacityDataMap = await CapacityUtils.getCapacityDataMapByDate( date );

    }

    async function loadBooking(): Promise<void> {

        if (!bookingId) return;
        pageData.bookingDocumentReference = SpaRadiseFirestore.getDocumentReference(
            bookingId, SpaRadiseEnv.BOOKING_COLLECTION
        );
        pageData.bookingData = await BookingUtils.getBookingData(bookingId);
        pageData.bookingDefaultData = { ...pageData.bookingData };
        await loadClientList();
        await loadServiceTransactionList();
        await loadVoucherTransactionList();
        await loadDiscounts();
        await loadPayments();

    }

    async function loadDiscounts(): Promise<void> {

        if (!bookingId || isNewMode) return;
        pageData.discountDataMap = await DiscountUtils.getDiscountDataMapByBooking(bookingId);
        pageData.discountDefaultDataMap = { ...pageData.discountDataMap };

    }

    async function loadClientList(): Promise<void> {

        if (!bookingId) return;
        pageData.clientDataMap = await ClientUtils.getClientDataMapByBooking(bookingId);
        pageData.clientDefaultDataMap = SpaRadiseDataMapUtils.clone(
            pageData.clientDataMap
        );

    }

    async function loadEmployeeData(): Promise<void> {

        const { date } = pageData;
        pageData.employeeDataMap = await EmployeeUtils.getActiveEmployeeDataMap(date);
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay(date)
            ;

    }

    async function loadFirstClient(): Promise<void> {

        const
            { accountData, accountData: { birthDate } } = pageData,
            clientId: string = getClientId(-1)
        ;
        pageData.clientDataMap[clientId] = {
            booking: SpaRadiseFirestore.getDocumentReference("new", SpaRadiseEnv.BOOKING_COLLECTION),
            name: PersonUtils.toString(accountData, "f mi l"),
            birthDate,
            notes: null
        };
        pageData.clientInfoMap[clientId] = {
            packageIncludedMap: {},
            packageServiceTransactionDataMap: {},
            packageVoucherTransactionKeyMap: {},
            serviceIncludedMap: {},
            serviceServiceTransactionKeyMap: {},
            serviceTransactionDataMap: {},
            serviceTransactionIndex: 0,
            showPackages: true,
            showServices: false,
            singleServiceIncludedMap: {},
            singleServiceVoucherTransactionKeyMap: {}
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
        const { accountType } = pageData.accountData;
        if( accountType === "management" )
            pageData.customerInOrder = {
                lastName: null as unknown as string,
                firstName: null as unknown as string,
                middleName: null,
                sex: null as unknown as sex,
                birthDate: null as unknown as Date,
                email: null as unknown as string,
                contactNumber: null as unknown as string,
                contactNumberAlternate: null,
                accountType: "customer"
            };
        if (isNewMode)
            if( pageData.customerInOrder === undefined ) await loadFirstClient();
        else if (isEditMode)
            await loadBooking();
        await loadServiceData();
        await loadJobData();
        await loadVoucherData();
        pageData.loaded = true;
        await handleChangeDate();
        reloadPageData();

    }

    async function loadPayments(): Promise<void> {

        if (!bookingId || isNewMode) return;
        pageData.paymentDataMap = await PaymentUtils.getPaymentDataMapByBooking(bookingId);
        pageData.paymentDefaultDataMap = { ...pageData.paymentDataMap };

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
            } = packageServiceDataMap[packageServiceId];
            packageServiceKeyMap[packageId][serviceId] = packageServiceId;

        }

    }

    async function loadServiceTransactionList(): Promise<void> {

        pageData.serviceTransactionDefaultDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByClientDataMap(
                pageData.clientDataMap
            )
            ;
        pageData.serviceTransactionDefaultDataMap = SpaRadiseDataMapUtils.clone(
            pageData.serviceTransactionDefaultDataMap
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

        ObjectUtils.clear(pageData.voucherDataOfDayMap);
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

    function reloadPageData(): void {

        setPageData({ ...pageData });

    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {

        event.preventDefault();
        await createBooking();
        navigate( `/` );

    }

    async function updateClientList(): Promise<void> {

        // delete
        // update
        await createClientList();

    }

    async function updateServiceTransactionList(): Promise<void> {

        // delete
        // update
        await createServiceTransactionList();

    }

    async function updateVoucherTransactionList(): Promise<void> {

        // delete
        // update
        await createVoucherTransactionList();

    }

    useEffect(() => { loadPageData(); }, []);

    return <>
        <LoadingScreen loading={!pageData.loaded}></LoadingScreen>
        <PopupModal pageData={pageData} reloadPageData={reloadPageData} />
        <NavBar pageData={pageData} reloadPageData={reloadPageData} />
        <form onSubmit={submit}>
            {
                (pageData.formIndex === 0) ? <ChooseClients pageData={pageData} reloadPageData={reloadPageData} />
                    : (pageData.formIndex === 1) ? <ChooseServices pageData={pageData} handleChangeDate={handleChangeDate} reloadPageData={reloadPageData} />
                        : (pageData.formIndex === 2) ? <ChooseTimeSlots pageData={pageData} reloadPageData={reloadPageData} />
                            : (pageData.formIndex === 3) ? <Summary pageData={pageData} reloadPageData={reloadPageData} />
                                : (pageData.formIndex === 4) ? <Finished pageData={pageData} reloadPageData={reloadPageData} />
                                    // other form indexes
                                    : <button type="button" onClick={() => { pageData.formIndex--; reloadPageData(); }}>None, Go Back</button>
            }
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

        const
            { clientDataMap, clientIndex } = pageData,
            clientId: string = getClientId(clientIndex)
            ;
        clientDataMap[clientId] = {
            booking: SpaRadiseFirestore.getDocumentReference("new", SpaRadiseEnv.BOOKING_COLLECTION),
            name: null as unknown as string,
            birthDate: null as unknown as Date,
            notes: null
        };
        clientInfoMap[clientId] = {
            packageIncludedMap: {},
            packageServiceTransactionDataMap: {},
            packageVoucherTransactionKeyMap: {},
            serviceIncludedMap: {},
            serviceServiceTransactionKeyMap: {},
            serviceTransactionDataMap: {},
            serviceTransactionIndex: 0,
            showPackages: true,
            showServices: false,
            singleServiceIncludedMap: {},
            singleServiceVoucherTransactionKeyMap: {}
        };
        pageData.clientIndex++;
        reloadPageData();

    }

    function checkFormValidity(): true | string {
        const { MIN_AGE_LIMIT } = SpaRadiseEnv;
        const { clientDataMap, date } = pageData;

        if (!date)
            return "No booking date given";

        for (let clientId in clientDataMap) {
            const { name, birthDate } = clientDataMap[clientId];
            if (!name) return "Please input client names";
            if (!birthDate) return "Please input client birth dates";
            if (DateUtils.getYearAge(birthDate) < MIN_AGE_LIMIT)
                return `The age limit is ${MIN_AGE_LIMIT}`;
        }

        return true;
    }


    async function nextPage(): Promise<void> {
        const error = checkFormValidity();

        if (error !== true) {
            pageData.popupData = {
                children: error,
                popupMode: "yesOnly",
                yesText: "OK"
            };
            reloadPageData();
            return;
        }

        pageData.formIndex++;
        reloadPageData();
    }

    async function deleteClient(clientId: string): Promise<void> {

        delete clientDataMap[clientId];
        delete clientInfoMap[clientId];
        reloadPageData();

    }

    function loadClientIdActive(): void {

        let minimum: number = Infinity;
        for (let clientId in clientDataMap) {

            const index = +(clientId.substring(1));
            if (index < minimum) minimum = index;

        }
        pageData.clientIdActive = getClientId(minimum);

    }

    async function previousPage(): Promise<void> {

        navigate("/");

    }

    loadClientIdActive();

    return <>
        <main className="booking-container">
            <section className="booking-form">
                <h1 className="booking-title">Who are the Clients?</h1>
                {
                    ( pageData.customerInOrder !== undefined ) ? <>
                        <label className="account-email" >Email Account</label>
                        <NewBookingEmailInput name="account-email" pageData={ pageData } required={ true }/>
                    </> : undefined
                }
                {
                    Object.keys(clientDataMap).sort().map(clientId => {
                        const clientData: ClientData = clientDataMap[clientId];
                        return (
                            <div className="client-row" key={clientId}>
                                <div className="client-input">
                                    <label className="form-row-label" >Name</label>
                                    <FormTinyTextInput documentData={clientData} documentId={clientId} keyName="name" pageData={pageData} required={true} />
                                </div>
                                <div className="client-input">
                                    <label className="form-row-label" >Birth Date</label>
                                    <FormDateInput documentData={clientData} documentId={clientId} keyName="birthDate" pageData={pageData} required={true} />
                                </div>
                                {
                                    (clientLength > 1) ?
                                        <button className="client-booking-delete-btn" type="button" onClick={() => deleteClient(clientId)}>Delete</button>
                                        : <></>
                                }
                            </div>
                        );
                    })
                }
                <button className="add-client-btn" type="button" onClick={addClient}>Add Another Client +</button>
                <div className="action-buttons">
                    <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                    <button className={checkFormValidity() === true ? `proceed-btn` : `back-btn`} type="button" onClick={nextPage}>Proceed (1/4)</button>
                </div>
            </section>
        </main>
    </>;

}

function ChooseServices({ pageData, handleChangeDate, reloadPageData }: {
    pageData: NewBookingPageData,
    handleChangeDate: () => Promise<void>,
    reloadPageData: () => void
}): JSX.Element {

    const
        {
            clientDataMap, clientIdActive, clientInfoMap, maintenanceDataMap, packageDataMap,
            packageServiceKeyMap, serviceDataMap
        } = pageData,
        {
            packageIncludedMap, serviceIncludedMap, serviceTransactionDataMap, singleServiceIncludedMap,
            showPackages, showServices
        } = clientInfoMap[clientIdActive]
        ;

    async function addPackage(packageId: documentId): Promise<void> {

        if (isConflictingPackage(packageId)) return;
        for (let serviceId in packageServiceKeyMap[packageId])
            await addServiceTransaction(serviceId, packageId);
        packageIncludedMap[packageId] = true;
        reloadPageData();

    }

    async function addServiceTransaction(
        serviceId: documentId, packageId?: documentId
    ): Promise<void> {

        if (pageData.maintenanceDataMap[serviceId].status === "inactive") return;
        const
            { serviceTransactionIndex } = clientInfoMap[clientIdActive],
            serviceTransactionId: string = getServiceTransactionId(
                clientIdActive, serviceTransactionIndex
            )
            ;
        serviceTransactionDataMap[serviceTransactionId] = {
            client: SpaRadiseFirestore.getDocumentReference(
                clientIdActive, SpaRadiseEnv.CLIENT_COLLECTION
            ),
            service: SpaRadiseFirestore.getDocumentReference(
                serviceId, SpaRadiseEnv.SERVICE_COLLECTION
            ),
            package: packageId ? SpaRadiseFirestore.getDocumentReference(
                packageId, SpaRadiseEnv.PACKAGE_COLLECTION
            ) : null,
            bookingDateTimeStart: null as unknown as Date,
            bookingDateTimeEnd: null as unknown as Date,
            actualBookingDateTimeStart: null,
            actualBookingDateTimeEnd: null,
            employee: null,
            notes: null,
            status: "serviceActive"
        };
        serviceIncludedMap[serviceId] = getServiceTransactionId(
            clientIdActive, serviceTransactionIndex
        );
        clientInfoMap[clientIdActive].serviceTransactionIndex++;

    }

    async function addSingleService(serviceId: documentId): Promise<void> {

        if (isConflictingService(serviceId)) return;
        await addServiceTransaction(serviceId);
        singleServiceIncludedMap[serviceId] = true;
        reloadPageData();

    }


    function checkFormValidity(): true | string {
        const { MIN_AGE_LIMIT } = SpaRadiseEnv;
        const { clientDataMap, date } = pageData;

        if (!date)
            return "No booking date given";
        const isSunday: boolean = date.getDay() === 0;
        if (isSunday)
            return "SpaRadise is closed on Sundays";

        for (let clientId in clientDataMap) {
            const { serviceTransactionDataMap } = clientInfoMap[ clientId ]
            if( ObjectUtils.keyLength( serviceTransactionDataMap ) === 0 )
                return `All clients must have reserved services.`;
        }

        return true;
    }


    async function nextPage(): Promise<void> {
        const error = checkFormValidity();

        if (error !== true) {
            pageData.popupData = {
                children: error,
                popupMode: "yesOnly",
                yesText: "OK"
            };
            reloadPageData();
            return;
        }

        pageData.formIndex++;
        reloadPageData();
    }


    async function deletePackage(packageId: documentId): Promise<void> {

        for (let serviceId in packageServiceKeyMap[packageId])
            await deleteServiceTransaction(serviceId);
        delete packageIncludedMap[packageId];
        reloadPageData();

    }

    async function deleteServiceTransaction(serviceId: documentId): Promise<void> {

        const serviceTransactionId = serviceIncludedMap[serviceId];
        delete serviceTransactionDataMap[serviceTransactionId];
        delete serviceIncludedMap[serviceId];

    }

    async function deleteSingleService(serviceId: documentId): Promise<void> {

        await deleteServiceTransaction(serviceId);
        delete singleServiceIncludedMap[serviceId];
        reloadPageData();

    }

    async function handleChangeClientActive(clientId: string): Promise<void> {

        pageData.clientIdActive = clientId;
        reloadPageData();

    }

    function isConflictingPackage(packageId: documentId): boolean {

        for (let serviceId in packageServiceKeyMap[packageId])
            if (isConflictingService(serviceId)) return true;
        return false;

    }

    function isConflictingService(serviceId: documentId): boolean {

        return serviceId in serviceIncludedMap;

    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    function togglePackages(): void {

        clientInfoMap[clientIdActive].showPackages =
            !clientInfoMap[clientIdActive].showPackages
            ;
        reloadPageData();

    }

    function toggleServices(): void {

        clientInfoMap[clientIdActive].showServices =
            !clientInfoMap[clientIdActive].showServices
            ;
        reloadPageData();

    }

    return <>
        <main className="booking-container">
            <section className="form-section client-date-section">
                <div className="date-input">
                    <label className="input-label">Choose date</label>
                    <BookingDateInput pageData={pageData} onChange={handleChangeDate} reloadPageData={reloadPageData} />
                </div>
            </section>
            <div className="client-input">
                <label className="client-selection">Select Client:</label>
                <div className="clickable-bars" id="client-selection">
                    {
                        Object.keys(clientDataMap).map(clientId =>
                            <div
                                key={clientId}
                                className={`client-item ${(clientId === clientIdActive) ? 'active' : ''}`}
                                data-client={`client${clientId}`}
                                onClick={() => handleChangeClientActive(clientId)}
                            >
                                {clientDataMap[clientId].name}
                            </div>
                        )
                    }
                </div>
            </div>

            <section className="form-section package-section">
                <div className="section-label">Select Packages:</div>
                <button className="toggle-button" type="button" onClick={togglePackages}>Packages ▼</button>
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
                                        const
                                            { name } = serviceDataMap[serviceId],
                                            isConflicting = isConflictingService(serviceId)
                                            ;
                                        return (
                                            <div className={isConflicting ? "included" : ""} key={serviceId}>
                                                {name} {isConflicting ? "(Already Added)" : ""}</div>
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
                <button type="button" className="toggle-button" onClick={toggleServices}>Services ▼</button>
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
                <FormTextArea documentData={clientDataMap[clientIdActive]} documentId={clientIdActive} keyName="notes" pageData={pageData} required={true} />
            </section>
            <section className="action-buttons">
                <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                <button className={checkFormValidity() === true ? `proceed-btn` : `back-btn`} type="button" onClick={nextPage}>Proceed (2/4)</button>            </section>
        </main >
    </>;

}

function ChooseTimeSlots({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const
        { bookingData, clientInfoMap, date, serviceTransactionOfDayDataMap } = pageData,
        dayPlannerPageData = {
            ...pageData,
            bookingDataMap: { "new": bookingData } as BookingDataMap,
            bookingIdActive: "new",
            employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
            serviceTransactionDefaultDataMap: serviceTransactionOfDayDataMap,
            serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
        }
        ;

    for (let clientId in clientInfoMap) {

        const { serviceTransactionDataMap } = clientInfoMap[clientId];
        for (let serviceTransactionId in serviceTransactionDataMap)
            dayPlannerPageData.serviceTransactionToAddDataMap[serviceTransactionId] =
                serviceTransactionDataMap[serviceTransactionId];

    }

    function checkFormValidity(): true | string {

        for (let clientId in clientInfoMap) {

            const { serviceTransactionDataMap } = clientInfoMap[clientId];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const {
                    bookingDateTimeEnd, bookingDateTimeStart
                } = serviceTransactionDataMap[serviceTransactionId];
                if (!bookingDateTimeStart || !bookingDateTimeEnd)
                    return "If a service is not eligible for scheduling, please ensure it is removed from the previous page to proceed.";

            }

        }
        return true;

    }

    async function nextPage(): Promise<void> {

        const error = checkFormValidity();
        if (error !== true) {

            pageData.popupData = {
                children: error,
                popupMode: "yesOnly",
                yesText: "OK"
            }
            reloadPageData();
            return;

        };
        pageData.formIndex++;
        reloadPageData();

    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    return <>
        <main className="booking-container">
            <section className="form-section client-date-section">
                <div className="time-slot-date">{DateUtils.toString(date, "Mmmm dd, yyyy")}</div>
            </section>
            <DayPlanner dayPlannerMode="newBooking" pageData={dayPlannerPageData} />
            <section className="action-buttons">
                <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                <button className={checkFormValidity() === true ? `proceed-btn` : `back-btn`} type="button" onClick={nextPage}>Proceed (3/4)</button>
            </section>
        </main>
    </>;

}

function Summary({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const { date, voucherTransactionDataMap } = pageData;

    async function addVoucher(): Promise<void> {

        const
            { voucherTransactionIndex } = pageData,
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

    async function checkFormValidity(): Promise<boolean> {

        return true;

    }

    function deleteVoucherTransaction(voucherTransactionId: string): void {

        delete pageData.voucherTransactionDataMap[voucherTransactionId];
        reloadPageData();

    }

    async function nextPage(): Promise<void> {

        pageData.formIndex++;
        reloadPageData();

    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    return <>
        <main className="booking-container">
            <section className="form-section booking-summary-section">
                <h2 className="summary-label">Booking Summary</h2>
                <section className="form-section client-date-section">
                    <div className="time-slot-date">{DateUtils.toString(date, "Mmmm dd, yyyy")}</div>
                </section>
                <section className="form-section booking-summary-section">
                    <BookingReceipt bookingReceiptMode="newBooking" pageData={pageData} showActualTime={false} addVoucher={addVoucher} deleteVoucherTransaction={deleteVoucherTransaction} reloadPageData={reloadPageData} />
                </section>
            </section>
            <section className="form-section booking-summary-section">
                <section className="action-buttons">
                    <button className="back-btn" type="button" onClick={previousPage}>Back</button>
                    <button className="proceed-btn" type="button" onClick={nextPage}>Proceed (4/4)</button>
                </section>
            </section>
        </main >
    </>;

}

function Finished({ pageData, reloadPageData }: {
    pageData: NewBookingPageData,
    reloadPageData: () => void
}): JSX.Element {

    const
        bookingId: string | undefined = useParams().bookingId,
        isNewMode: boolean = (bookingId === "new"),
        isEditMode: boolean = (bookingId !== undefined && !isNewMode),
        navigate = useNavigate()
        ;

    function checkFormValidity(): true | string {
        const { MIN_AGE_LIMIT } = SpaRadiseEnv;
        const { clientDataMap, date } = pageData;

        if (!date)
            return "No booking date given";

        for (let clientId in clientDataMap) {
            const { name, birthDate } = clientDataMap[clientId];
            if (!name) return "Please input client names";
            if (!birthDate) return "Please input client birth dates";
            if (DateUtils.getYearAge(birthDate) < MIN_AGE_LIMIT)
                return `The age limit is ${MIN_AGE_LIMIT}`;
        }

        return true;
    }


    async function nextPage(): Promise<void> {
        const error = checkFormValidity();

        if (error !== true) {
            pageData.popupData = {
                children: error,
                popupMode: "yesOnly",
                yesText: "OK"
            };
            reloadPageData();
            return;
        }

        pageData.formIndex++;
        reloadPageData();
    }

    async function previousPage(): Promise<void> {

        pageData.formIndex--;
        reloadPageData();

    }

    async function updateClientList(): Promise<void> {



    }

    async function updateVoucherTransactionList(): Promise<void> {



    }

    return <>
        <main className="booking-container-last">
            <div className="confirmation-message">Confirm Booking</div>
            <section className="last-action-buttons">
                <button className="back-btn-confirm" type="button" onClick={previousPage}>Back</button>
                <button className={checkFormValidity() === true ? `proceed-btn` : `back-btn`}  type="submit">Complete Booking</button>
            </section>
        </main>
    </>;

}

export function getClientId(clientIndex: number): string {

    return `c${clientIndex}`;

}

export function getServiceTransactionId(
    clientId: string, serviceTransactionIndex: number
): string {

    return `${clientId}st${serviceTransactionIndex}`;

}

export function getVoucherTransactionId(voucherIndex: number): string {

    return `vt${voucherIndex}`;

}
