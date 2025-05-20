import {
    AccountData,
    BookingData,
    BookingDataMap,
    CapacityDataMap,
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
import AccountUtils from "../firebase/AccountUtils";
import BookingReceipt from "../components/BookingReceipt";
import BookingUtils from "../firebase/BookingUtils";
import ClientUtils from "../firebase/ClientUtils";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import DayPlanner from "../components/DayPlanner";
import DiscountUtils from "../firebase/DiscountUtils";
import { DocumentReference } from "firebase/firestore/lite";
import EmployeeLeaveUtils from "../firebase/EmployeeLeaveUtils";
import EmployeeSidebar from "../components/EmployeeSidebar";
import EmployeeUtils from "../firebase/EmployeeUtils";
import BackButton from "../images/back button.png";
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
import PaymentUtils from "../firebase/PaymentUtils";
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
import "../styles/BookingManagement.css"
import MoneyUtils from "../firebase/MoneyUtils";
import CapacityUtils from "../firebase/CapacityUtils";
interface EmployeeBookingManagementPageData extends SpaRadisePageData {

    accountData: AccountData,
    bookingData: BookingData,
    bookingDefaultData: BookingData,
    bookingDataMap: BookingDataMap,
    bookingDocumentReference?: DocumentReference,
    capacityDataMap: CapacityDataMap,
    clientDataMap: ClientDataMap,
    clientDefaultDataMap: ClientDataMap,
    clientIdActive: documentId,
    clientInfoMap: {
        [clientId: string]: {
            packageServiceTransactionDataMap: { [packageId: documentId]: ServiceTransactionDataMap },
            packageVoucherTransactionKeyMap: { [packageId: documentId]: documentId | undefined },
            serviceServiceTransactionKeyMap: { [serviceId: documentId]: documentId },
            serviceTransactionDataMap: ServiceTransactionDataMap,
            singleServiceVoucherTransactionKeyMap: { [serviceId: documentId]: documentId | undefined }
        }
    },
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

export default function EmployeeBookingManagement(): JSX.Element {

    const
        [pageData, setPageData] = useState<EmployeeBookingManagementPageData>({
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
            capacityDataMap: {},
            clientDataMap: {},
            clientDefaultDataMap: {},
            clientIdActive: null as unknown as string,
            clientInfoMap: {},
            date: null as unknown as Date,
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
        bookingId: string | undefined = useParams().id,
        dayPlannerPageData = {
            ...pageData,
            employeeLeaveDataMap: pageData.employeeLeaveOfDayDataMap,
            serviceTransactionDefaultDataMap: pageData.serviceTransactionOfDayDataMap,
            serviceTransactionToAddDataMap: {} as ServiceTransactionDataMap
        },
        navigate = useNavigate()
        ;

    async function checkFormValidity(): Promise<boolean> {


        return true;

    }

    async function createDiscountList(): Promise<void> {

        const { bookingDocumentReference, discountDataMap, discountDefaultDataMap } = pageData;
        if (!bookingDocumentReference) return;
        for (let discountId in discountDataMap) {

            const isNew: boolean = !(discountId in discountDefaultDataMap);
            if (!isNew) continue;
            const
                discountData = discountDataMap[discountId],
                discountDocumentReference = await DiscountUtils.createDiscount(discountData)
                ;
            delete discountDataMap[discountId];
            discountDataMap[discountDocumentReference.id] = discountData;

        }
        pageData.discountDefaultDataMap = SpaRadiseDataMapUtils.clone(pageData.discountDataMap);

    }

    async function createPaymentList(): Promise<void> {

        const { bookingDocumentReference, paymentDataMap, paymentDefaultDataMap } = pageData;
        if (!bookingDocumentReference) return;
        for (let paymentId in paymentDataMap) {

            const isNew: boolean = !(paymentId in paymentDefaultDataMap);
            if (!isNew) continue;
            const
                paymentData = paymentDataMap[paymentId],
                paymentDocumentReference = await PaymentUtils.createPayment(paymentData)
                ;
            delete paymentDataMap[paymentId];
            paymentDataMap[paymentDocumentReference.id] = paymentData;

        }
        pageData.paymentDefaultDataMap = SpaRadiseDataMapUtils.clone(pageData.paymentDataMap);

    }

    async function loadBookingData(): Promise<void> {

        pageData.bookingDataMap = await BookingUtils.getBookingDataMapAll();
        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay(pageData.date, false)
            ;
        if (!bookingId) return;
        pageData.bookingData = pageData.bookingDataMap[bookingId];
        pageData.bookingDefaultData = { ...pageData.bookingData };
        pageData.accountData = await AccountUtils.getAccountData(pageData.bookingData.account);
        const { clientDataMap, clientInfoMap } = pageData;
        let clientId: documentId = "";
        for (clientId in clientDataMap)
            if (clientDataMap[clientId].booking.id === bookingId)
                clientInfoMap[clientId] = {
                    packageServiceTransactionDataMap: {},
                    packageVoucherTransactionKeyMap: {},
                    serviceServiceTransactionKeyMap: {},
                    serviceTransactionDataMap: {},
                    singleServiceVoucherTransactionKeyMap: {}
                };
        const
            serviceTransactionOfClientDataMap: ServiceTransactionDataMap =
                await ServiceTransactionUtils.getServiceTransactionDataMapByClient(clientId)
            ,
            serviceTransactionId: documentId = Object.keys(serviceTransactionOfClientDataMap)[0]
            ;
        pageData.date = DateUtils.setTime(
            serviceTransactionOfClientDataMap[serviceTransactionId].bookingDateTimeStart,
            { hr: 12, min: 0 }
        );
        await loadVoucherTransactionList();
        pageData.discountDataMap = await DiscountUtils.getDiscountDataMapByBooking(bookingId);
        pageData.discountDefaultDataMap = { ...pageData.discountDataMap };
        pageData.paymentDataMap = await PaymentUtils.getPaymentDataMapByBooking(bookingId);
        pageData.paymentDefaultDataMap = { ...pageData.paymentDataMap };
        pageData.bookingDocumentReference = SpaRadiseFirestore.getDocumentReference(
            bookingId, SpaRadiseEnv.BOOKING_COLLECTION
        );

    }

    async function loadClientData(): Promise<void> {

        pageData.clientDataMap = await ClientUtils.getClientDataMapAll();
        pageData.clientDefaultDataMap = SpaRadiseDataMapUtils.clone(pageData.clientDataMap);
        pageData.clientIdActive =
            ObjectUtils.getFirstKeyName(pageData.clientDataMap) ?? null as unknown as string
            ;

    }

    async function loadEmployeeData(): Promise<void> {

        const { date } = pageData;
        pageData.employeeDataMap = await EmployeeUtils.getEmployeeDataMapAll();
        pageData.employeeLeaveOfDayDataMap =
            await EmployeeLeaveUtils.getApprovedEmployeeLeaveDataMapByDay(date)
            ;

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
        pageData.capacityDataMap = await CapacityUtils.getCapacityDataMapByDate( pageData.date );
        pageData.loaded = true;
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
            } = packageServiceDataMap[packageServiceId];
            packageServiceKeyMap[packageId][serviceId] = packageServiceId;

        }

    }

    async function loadServiceTransactionData(): Promise<void> {

        pageData.serviceTransactionOfDayDataMap =
            await ServiceTransactionUtils.getServiceTransactionDataMapByDay(pageData.date, false)
            ;
        const { clientInfoMap, serviceTransactionOfDayDataMap } = pageData;
        for (let serviceTransactionId in serviceTransactionOfDayDataMap) {

            const
                serviceTransactionData = serviceTransactionOfDayDataMap[serviceTransactionId],
                clientId = serviceTransactionData.client.id
                ;
            if (clientId in clientInfoMap)
                clientInfoMap[clientId].serviceTransactionDataMap[serviceTransactionId] =
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
        switch (pageData.formIndex) {

            case 0:
                const { canceledDateTime, finishedDateTime } = pageData.bookingData;
                if (canceledDateTime || !finishedDateTime) return;
                await updateBookingEmployeeData();
                break;
            case 1:
                const change = MoneyUtils.add(
                    pageData.paymentTotal
                    -pageData.initialPrice,
                    pageData.voucherDiscount,
                    pageData.discountTotal
                );
                if( change < 0 ) {

                    pageData.popupData = {
                        children: "There is too much payment.",
                        popupMode: "yesOnly"
                    }
                    return;

                }
                await updateBookingPriceData();
                pageData.popupData = {
                    children: "Booking done!",
                    popupMode: "yesOnly",
                    yes: () => navigate(
                        `/management/bookings/menu/`
                        + DateUtils.toString(pageData.date, "yyyy-mm-dd")
                    )
                }

        }
        pageData.formIndex++;
        reloadPageData();

    }

    async function updateBookingEmployeeData(): Promise<void> {

        pageData.loaded = false;
        reloadPageData();
        const { bookingData, updateMap } = pageData;
        if (bookingId && bookingId in updateMap) {

            await BookingUtils.updateBooking(bookingId, bookingData);
            pageData.bookingDefaultData = { ...bookingData };
            delete updateMap[bookingId];

        }
        await updateClientList();
        pageData.loaded = true;
        reloadPageData();

    }

    async function updateBookingPriceData(): Promise<void> {

        pageData.loaded = false;
        reloadPageData();
        const { bookingData, updateMap } = pageData;
        if (bookingId && bookingId in updateMap) {

            await BookingUtils.updateBooking(bookingId, bookingData);
            pageData.bookingDefaultData = { ...bookingData };
            delete updateMap[bookingId];

        }
        await updateDiscountList();
        await updatePaymentList();
        pageData.loaded = true;
        reloadPageData();

    }

    async function updateClientList(): Promise<void> {

        const {
            clientDataMap, clientDefaultDataMap, clientInfoMap, serviceTransactionDefaultDataMap,
            updateMap
        } = pageData;

        for (let clientId in clientInfoMap) {

            const
                clientData = clientDataMap[clientId],
                { serviceTransactionDataMap } = clientInfoMap[clientId]
                ;
            if (clientId in updateMap) {

                await ClientUtils.updateClient(clientId, clientData);
                clientDefaultDataMap[clientId] = { ...clientData };
                delete updateMap[clientId];

            }
            for (let serviceTransactionId in serviceTransactionDataMap) {

                if (!(serviceTransactionId in updateMap)) continue;
                const serviceTransactionData = serviceTransactionDataMap[serviceTransactionId];
                await ServiceTransactionUtils.updateServiceTransaction(
                    serviceTransactionId, serviceTransactionData
                );
                serviceTransactionDefaultDataMap[serviceTransactionId] = {
                    ...serviceTransactionData
                };
                delete updateMap[clientId];

            }


        }

    }

    async function updateDiscountList(): Promise<void> {

        await updateDiscountListInUpdateMap();
        await createDiscountList();

    }

    async function updateDiscountListInUpdateMap(): Promise<void> {

        const { discountDataMap, discountDefaultDataMap, updateMap } = pageData;
        for (let discountId in discountDataMap) {

            const isDiscountId: boolean = discountId in discountDefaultDataMap;
            if (!isDiscountId) continue;
            const discountData = discountDataMap[discountId];
            await DiscountUtils.updateDiscount(discountId, discountData);
            delete updateMap[discountId];
            discountDefaultDataMap[discountId] = { ...discountData };

        }

    }

    async function updatePaymentList(): Promise<void> {

        await updatePaymentListInUpdateMap();
        await createPaymentList();

    }

    async function updatePaymentListInUpdateMap(): Promise<void> {

        const { paymentDataMap, paymentDefaultDataMap, updateMap } = pageData;
        for (let paymentId in paymentDataMap) {

            const isPaymentId: boolean = paymentId in paymentDefaultDataMap;
            if (!isPaymentId) continue;
            const paymentData = paymentDataMap[paymentId];
            await PaymentUtils.updatePayment(paymentId, paymentData);
            delete updateMap[paymentId];
            paymentDefaultDataMap[paymentId] = { ...paymentData };

        }

    }

    useEffect(() => { loadPageData(); }, []);

    const status = (
        pageData.bookingData.canceledDateTime ? "canceled"
            : pageData.bookingData.finishedDateTime ? "finished"
                : pageData.bookingData.activeDateTime ? "active"
                    : pageData.bookingData.reservedDateTime ? "reserved"
                        : "pending"
    );

    return (
        <>
            <LoadingScreen loading={!pageData.loaded} />
            <PopupModal pageData={pageData} reloadPageData={reloadPageData} />
            <EmployeeSidebar pageData={ pageData } reloadPageData={ reloadPageData }/>

            <form onSubmit={submit} className="booking-form-layout">
                <button onClick={() => navigate(-1)} className="service-back-arrow" aria-label="Back" style={{ background: "none", border: "none", padding: 0 }}><img src={BackButton} alt="Back" className="back-icon" /></button>


                <div className="booking-details">
                    <div className="booking-meta">
                        <div className="booking-row">
                            <div className="booking-field">
                                <span className="label">Name:</span>
                                <span className="value">{PersonUtils.toString(pageData.accountData, "f mi l")}</span>
                            </div>
                            <div className="booking-field">
                                <span className="label">Email:</span>
                                <span className="value">{pageData.accountData.email}</span>
                            </div>
                            <div className="booking-field">
                                <span className="label">Contact #:</span>
                                <span className="value">{pageData.accountData.contactNumber}</span>
                            </div>
                            <div className="booking-field">
                                <span className="label">Alt Contact #:</span>
                                <span className="value">{pageData.accountData.contactNumberAlternate ?? "N/A"}</span>
                            </div>
                            <div className="booking-field">
                                <span className="label">Booking ID:</span>
                                <span className="value">{bookingId}</span>
                            </div>
                            <div className="booking-field">
                                <span className="label">Booking Date:</span>
                                <span className="value">
                                    {pageData.date ? DateUtils.toString(pageData.date, "Mmmm dd, yyyy") : ""}
                                </span>
                            </div>
                        </div>
                        <div className="booking-statuses">
                            <div className="booking-field">
                                <span className={`label status-dot ${status === "reserved" ? "active reserved" : "inactive"}`}>
                                    Reserved At:
                                </span>
                                <span className="value">
                                    {pageData.bookingData.reservedDateTime
                                        ? DateUtils.toString(pageData.bookingData.reservedDateTime, "Mmmm dd, yyyy - hh:mm a.m.")
                                        : "-"}
                                </span>
                            </div>
                            <div className="booking-field">
                                <span className={`label status-dot ${status === "active" ? "active active-status" : "inactive"}`}>
                                    Active At:
                                </span>
                                <span className="value">
                                    {pageData.bookingData.activeDateTime
                                        ? DateUtils.toString(pageData.bookingData.activeDateTime, "Mmmm dd, yyyy - hh:mm a.m.")
                                        : "-"}
                                </span>
                            </div>
                            <div className="booking-field">
                                <span className={`label status-dot ${status === "finished" ? "active finished" : "inactive"}`}>
                                    Finished At:
                                </span>
                                <span className="value">
                                    {pageData.bookingData.finishedDateTime
                                        ? DateUtils.toString(pageData.bookingData.finishedDateTime, "Mmmm dd, yyyy - hh:mm a.m.")
                                        : "-"}
                                </span>
                            </div>
                            <div className="booking-field">
                                <span className={`label status-dot ${status === "canceled" ? "active canceled" : "inactive"}`}>
                                    Canceled At:
                                </span>
                                <span className="value">
                                    {pageData.bookingData.canceledDateTime
                                        ? DateUtils.toString(pageData.bookingData.canceledDateTime, "Mmmm dd, yyyy - hh:mm a.m.")
                                        : "-"}
                                </span>
                            </div>
                        </div>

                    </div>
                </div>

                <DayPlanner dayPlannerMode="management" pageData={dayPlannerPageData} show={false} />

                {pageData.formIndex === 0 ? (
                    <EditServiceTransactions
                        bookingId={bookingId}
                        pageData={pageData}
                        reloadPageData={reloadPageData}
                        updateBooking={updateBookingEmployeeData}
                    />
                ) : pageData.formIndex === 1 ? (
                    <EditPayments
                        bookingId={bookingId}
                        pageData={pageData}
                        reloadPageData={reloadPageData}
                        updateBooking={updateBookingPriceData}
                    />
                ) : (
                    <button type="button" onClick={() => { pageData.formIndex--; reloadPageData(); }}>
                        None, Go Back
                    </button>
                )}

            </form>
        </>
    );



}

function EditServiceTransactions({ bookingId, pageData, reloadPageData, updateBooking }: {
    bookingId: documentId | undefined,
    pageData: EmployeeBookingManagementPageData,
    reloadPageData: () => void,
    updateBooking: () => Promise<void> | void
}): JSX.Element {

    function cancelAll(): void {

        if (!bookingId) return;
        const {
            clientInfoMap, bookingDefaultData, serviceTransactionDefaultDataMap, updateMap
        } = pageData;
        for (let clientId in clientInfoMap) {

            const { serviceTransactionDataMap } = clientInfoMap[clientId];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const
                    serviceTransactionData = serviceTransactionDataMap[ serviceTransactionId ],
                    serviceTransactionDefaultData =
                        serviceTransactionDefaultDataMap[ serviceTransactionId ]
                    ,
                    { status } = serviceTransactionData
                ;
                if( status === "serviceCanceled" || status === "serviceWaived" ) continue;
                serviceTransactionData.status = "serviceCanceled";
                const
                    statusDefault = serviceTransactionDefaultData.status,
                    isDefault: boolean = ( status === statusDefault ),
                    hasUpdateRecord: boolean = (serviceTransactionId in updateMap)
                    ;
                if (!isDefault) {

                    if (!hasUpdateRecord) updateMap[serviceTransactionId] = {};
                    updateMap[serviceTransactionId].status = true;

                } else if (hasUpdateRecord) {

                    delete updateMap[serviceTransactionId].status;
                    if (!ObjectUtils.hasKeys(updateMap[serviceTransactionId])) delete updateMap[serviceTransactionId];

                }

            }

        }
        setCanceledBooking();

    }

    async function checkFormValidity(): Promise<boolean> {

        return true;

    }

    async function handleChangeClientActive(clientId: string): Promise<void> {

        pageData.clientIdActive = clientId;
        reloadPageData();

    }

    function setActiveBooking(): void {

        if (!bookingId) return;
        const
            { clientInfoMap, bookingData, bookingDefaultData, updateMap } = pageData,
            dateList: Date[] = []
            ;
        for (let clientId in clientInfoMap) {

            const { serviceTransactionDataMap } = clientInfoMap[clientId];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const {
                    actualBookingDateTimeStart
                } = serviceTransactionDataMap[serviceTransactionId];
                if (!actualBookingDateTimeStart) continue;
                dateList.push(actualBookingDateTimeStart);

            }

        }
        const minimum: Date | null = DateUtils.getMinimum(dateList) || null;
        bookingData.activeDateTime = minimum;
        const
            dateDefault = bookingDefaultData.activeDateTime,
            isDefault: boolean = (dateDefault && minimum) ? DateUtils.areSameByMinute(
                dateDefault, minimum
            ) : !minimum,
            hasUpdateRecord: boolean = (bookingId in updateMap)
            ;
        if (!isDefault) {

            if (!hasUpdateRecord) updateMap[bookingId] = {};
            updateMap[bookingId].activeDateTime = true;

        } else if (hasUpdateRecord) {

            delete updateMap[bookingId].activeDateTime;
            if (!ObjectUtils.hasKeys(updateMap[bookingId])) delete updateMap[bookingId];

        }

    }

    function setCanceledBooking(): void {

        if (!bookingId) return;
        const { clientInfoMap, bookingData, bookingDefaultData, updateMap } = pageData;
        let isCanceled: boolean = true;
        for (let clientId in clientInfoMap) {

            const { serviceTransactionDataMap } = clientInfoMap[clientId];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const { status } = serviceTransactionDataMap[serviceTransactionId];
                isCanceled = ( status === "serviceCanceled" || status === "serviceWaived" );

            }
            if (!isCanceled) break;

        }
        if( !isCanceled ) return;
        bookingData.canceledDateTime = new Date();
        const
            dateDefault = bookingDefaultData.canceledDateTime,
            isDefault: boolean = dateDefault ? DateUtils.areSameByMinute(
                dateDefault, bookingData.canceledDateTime
            ) : false,
            hasUpdateRecord: boolean = (bookingId in updateMap)
            ;
        if (!isDefault) {

            if (!hasUpdateRecord) updateMap[bookingId] = {};
            updateMap[bookingId].canceledDateTime = true;

        } else if (hasUpdateRecord) {

            delete updateMap[bookingId].canceledDateTime;
            if (!ObjectUtils.hasKeys(updateMap[bookingId])) delete updateMap[bookingId];

        }

    }

    function setFinishedBooking(): void {

        if (!bookingId) return;
        const
            { clientInfoMap, bookingData, bookingDefaultData, updateMap } = pageData,
            dateList: Date[] = []
            ;
        let
            isFinished: boolean = true,
            maximum: Date | null = null
            ;
        for (let clientId in clientInfoMap) {

            const { serviceTransactionDataMap } = clientInfoMap[clientId];
            for (let serviceTransactionId in serviceTransactionDataMap) {

                const
                    {
                        actualBookingDateTimeEnd, status
                    } = serviceTransactionDataMap[serviceTransactionId],
                    canceled = ( status === "serviceCanceled" || status === "serviceWaived" )
                ;
                if( canceled ) continue;
                if ( !actualBookingDateTimeEnd ) {

                    isFinished = false;
                    break;

                }
                dateList.push(actualBookingDateTimeEnd);

            }
            if (!isFinished) break;

        }
        maximum = isFinished ? (DateUtils.getMaximum(dateList) || null) : null;
        bookingData.finishedDateTime = maximum;
        const
            dateDefault = bookingDefaultData.finishedDateTime,
            isDefault: boolean = (dateDefault && maximum) ? DateUtils.areSameByMinute(
                dateDefault, maximum
            ) : !maximum,
            hasUpdateRecord: boolean = (bookingId in updateMap)
            ;
        if (!isDefault) {

            if (!hasUpdateRecord) updateMap[bookingId] = {};
            updateMap[bookingId].finishedDateTime = true;

        } else if (hasUpdateRecord) {

            delete updateMap[bookingId].finishedDateTime;
            if (!ObjectUtils.hasKeys(updateMap[bookingId])) delete updateMap[bookingId];

        }

    }

    const isEditable = !pageData.bookingDefaultData?.finishedDateTime && !pageData.bookingDefaultData?.canceledDateTime

    return (
        <main className="employee-booking-management-main-content">
            <section className="client-input">
                <label className="client-selection-booking">Select Client:</label>
                <div className="clickable-bars" id="client-selection-booking">
                    {Object.keys(pageData.clientDataMap).map((clientId) => (
                        <div
                            className={`client-item ${clientId === pageData.clientIdActive ? 'active' : ''}`}
                            data-client={`client${clientId}`}
                            key={clientId}
                            onClick={() => handleChangeClientActive(clientId)}
                        >
                            {pageData.clientDataMap[clientId].name}
                        </div>
                    ))}
                </div>
            </section>

            <section className="service-scroll-container">
                {pageData.clientInfoMap[pageData.clientIdActive]?.serviceTransactionDataMap ?
                    Object.keys(pageData.clientInfoMap[pageData.clientIdActive].serviceTransactionDataMap).map(
                        (serviceTransactionId) => {
                            const {
                                clientIdActive,
                                clientInfoMap,
                                date,
                                employeeDataMap,
                                packageDataMap,
                                serviceDataMap,
                                serviceTransactionDefaultDataMap,
                                serviceTransactionEmployeeListKeyMap,
                            } = pageData;

                            if (!serviceTransactionEmployeeListKeyMap[serviceTransactionId]) return null;

                            const { serviceTransactionDataMap } = clientInfoMap[clientIdActive];
                            const serviceTransactionData = serviceTransactionDataMap[serviceTransactionId];
                            const {
                                service: { id: serviceId },
                                actualBookingDateTimeEnd,
                                actualBookingDateTimeStart,
                                bookingDateTimeEnd,
                                bookingDateTimeStart,
                                employee,
                            } = serviceTransactionData;

                            const dateRange = new DateRange(bookingDateTimeStart, bookingDateTimeEnd);
                            const packageId = serviceTransactionData.package?.id;
                            const serviceTransactionDefaultData =
                                serviceTransactionDefaultDataMap[serviceTransactionId];

                            const serviceTransactionEmployeeDataMap = ObjectUtils.filter(
                                employeeDataMap,
                                (employeeId) =>
                                    serviceTransactionEmployeeListKeyMap[serviceTransactionId].includes(employeeId)
                            );

                            const status =
                                serviceTransactionData.status === "serviceWaived" ? 'waived'
                                : serviceTransactionData.status === "serviceCanceled" ? 'canceled'
                                : actualBookingDateTimeEnd ? 'finished'
                                : actualBookingDateTimeStart ? 'active'
                                : 'pending'
                            ;

                            const canceled = ( status === 'canceled' || status === "waived" );

                            return (
                                <div className={`service-card ${status}`} key={serviceTransactionId}>
                                    <div className="service-card-header">
                                        <h3 className="service-title">{serviceDataMap[serviceId].name}</h3>
                                        <span className="service-promo">{packageId ? packageDataMap[packageId].name : ''}</span>
                                        <span className="service-time">{dateRange.toString('h:mmAM-h:mmAM')}</span>
                                    </div>

                                    <div className="service-card-body">
                                        <div className="form-group">
                                            <label>Employee Assigned</label>
                                            <FormEmployeeSelect
                                                documentData={serviceTransactionData}
                                                documentDefaultData={serviceTransactionDefaultData}
                                                documentId={serviceTransactionId}
                                                employeeDataMap={serviceTransactionEmployeeDataMap}
                                                pageData={pageData}
                                                keyName="employee"
                                                readOnly={!isEditable || canceled}
                                                required={true}
                                                onChange={reloadPageData}
                                            >
                                                <option value="">Assign employee</option>
                                            </FormEmployeeSelect>
                                        </div>

                                        <div className="form-group">
                                            <label>Actual Start Time</label>
                                            <FormTimeInput
                                                className={canceled ? 'na' : 'start'}
                                                date={date}
                                                documentData={serviceTransactionData}
                                                documentDefaultData={serviceTransactionDefaultData}
                                                documentId={serviceTransactionId}
                                                pageData={pageData}
                                                keyName="actualBookingDateTimeStart"
                                                readOnly={!isEditable || canceled || !employee}
                                                required={true}
                                                onChange={() => {
                                                    setActiveBooking();
                                                    reloadPageData();
                                                }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Actual End Time</label>
                                            <FormTimeInput
                                                className={canceled ? 'na' : 'end'}
                                                date={date}
                                                documentData={serviceTransactionData}
                                                documentDefaultData={serviceTransactionDefaultData}
                                                documentId={serviceTransactionId}
                                                min={actualBookingDateTimeStart || undefined}
                                                pageData={pageData}
                                                keyName="actualBookingDateTimeEnd"
                                                readOnly={!isEditable || canceled || !employee || !actualBookingDateTimeStart}
                                                required={true}
                                                onChange={() => {
                                                    setFinishedBooking();
                                                    reloadPageData();
                                                }}
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Notes</label>
                                            <FormTextArea
                                                className="booking-notes"
                                                documentData={serviceTransactionData}
                                                documentDefaultData={serviceTransactionDefaultData}
                                                documentId={serviceTransactionId}
                                                keyName="notes"
                                                pageData={pageData}
                                            />
                                        </div>
                                    </div>

                                    <div className="service-card-footer">
                                        {
                                        status === 'waived' ? (
                                            <span className="status-text waived">WAIVED</span>
                                        ) : status === 'canceled' ? (
                                            <FormMarkButton<serviceTransactionStatus>
                                                confirmMessage="Would you like to waive this service transaction?"
                                                documentData={serviceTransactionData}
                                                documentDefaultData={serviceTransactionDefaultData}
                                                documentId={serviceTransactionId}
                                                keyName="status"
                                                noText="Back"
                                                pageData={pageData}
                                                value="serviceWaived"
                                                reloadPageData={reloadPageData}
                                                yesText="Yes, Waive This"
                                                className="btn-waive-booking"
                                            >
                                                WAIVE
                                            </FormMarkButton>
                                        ) : status === 'finished' ? (
                                            <span className="status-text finished">FINISHED</span>
                                        ) : (
                                            <FormMarkButton<serviceTransactionStatus>
                                                confirmMessage="Would you like to cancel this service transaction?"
                                                documentData={serviceTransactionData}
                                                documentDefaultData={serviceTransactionDefaultData}
                                                documentId={serviceTransactionId}
                                                keyName="status"
                                                noText="Back"
                                                pageData={pageData}
                                                value="serviceCanceled"
                                                reloadPageData={reloadPageData}
                                                yesText="Yes, Cancel This"
                                                className="btn-cancel-booking"
                                            >
                                                CANCEL
                                            </FormMarkButton>
                                        )}
                                    </div>
                                </div>
                            );
                        }
                    ) : undefined
                }
            </section>

            <div className="footer-actions">
                {
                    isEditable ? <button className="btn cancel-all-booking" type="button" onClick={ cancelAll }>
                        Cancel All
                    </button> : undefined
                }
                <button className="btn save-booking" type="button" onClick={updateBooking}>
                    Save
                </button>
                <button className="btn proceed-booking" type="submit">
                    Proceed to Payment
                </button>
            </div>
        </main>
    );


}

function EditPayments({ bookingId, pageData, reloadPageData, updateBooking }: {
    bookingId: documentId | undefined,
    pageData: EmployeeBookingManagementPageData,
    reloadPageData: () => void,
    updateBooking: () => Promise<void> | void
}): JSX.Element {

    const navigate = useNavigate();

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

    async function checkFormValidity(): Promise<boolean> {

        return true;

    }

    function deleteVoucherTransaction(voucherTransactionId: string): void {

        delete pageData.voucherTransactionDataMap[voucherTransactionId];
        reloadPageData();

    }

    async function previousPage(): Promise<void> {

        const formIndex: number = pageData.formIndex--;
        if (formIndex === 0) {

            navigate(-1);
            return;

        }
        reloadPageData();

    }

    return <main className="employee-booking-management-main-content">
        <BookingReceipt bookingReceiptMode="management" pageData={pageData} showActualTime={true} addVoucher={addVoucher} deleteVoucherTransaction={deleteVoucherTransaction} reloadPageData={reloadPageData} />
        <button className="finish-booking-management"type="submit">Finish Booking</button>
    </main>

}

export function getVoucherTransactionId(voucherIndex: number): string {

    return `vt${voucherIndex}`;

}
