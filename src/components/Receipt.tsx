import ArrayUtils from "../utils/ArrayUtils";
import DateRange from "../utils/DateRange";
import DateUtils from "../utils/DateUtils";
import {
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
    VoucherDataMap,
    VoucherPackageDataMap,
    VoucherServiceDataMap,
    VoucherTransactionDataMap
} from "../firebase/SpaRadiseTypes";
import {
    useEffect,
    useState
} from "react";
import NumberUtils from "../utils/NumberUtils";
import ObjectUtils from "../utils/ObjectUtils";
import PersonUtils from "../utils/PersonUtils";
import ServiceUtils from "../firebase/ServiceUtils";
import { SpaRadisePageData } from "../firebase/SpaRadiseTypes";
import StringUtils from "../utils/StringUtils";
import { useNavigate } from "react-router-dom";

interface ReceiptPageData extends SpaRadisePageData {

    bookingData: BookingData,
    clientDataMap: ClientDataMap,
    date: Date,
    maintenanceDataMap: { [ documentId: documentId ]: PackageMaintenanceData | ServiceMaintenanceData },
    packageDataMap: PackageDataMap,
    serviceDataMap: ServiceDataMap,
    serviceTransactionDataMap: ServiceTransactionDataMap,
    voucherDataMap: VoucherDataMap,
    voucherTransactionDataMap: VoucherTransactionDataMap

}

// client, single service, package, price, discount type, discount, new price

export default function Receipt( {
    pageData
}: {
    pageData: ReceiptPageData
} ): JSX.Element {


    return <></>;

}
