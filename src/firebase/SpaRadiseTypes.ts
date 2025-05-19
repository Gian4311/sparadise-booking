import { DocumentReference } from "firebase/firestore/lite";

export interface AccountData extends SpaRadiseDocumentData {

    lastName: string,
    firstName: string,
    middleName: string | null,
    sex: sex,
    birthDate: Date,
    email: string,
    contactNumber: string,
    contactNumberAlternate: string | null,
    accountType: accountType

}

export interface AccountDataMap extends SpaRadiseDataMap< AccountData > {

    [ accountId: string ]: AccountData

}

export interface BookingData extends SpaRadiseDocumentData {

    account: DocumentReference,
    reservedDateTime: Date,
    activeDateTime: Date | null,
    finishedDateTime: Date | null,
    canceledDateTime: Date | null

}

export interface BookingDataMap extends SpaRadiseDataMap< BookingData > {

    [ bookingId: string ]: BookingData

}

export interface ClientData extends SpaRadiseDocumentData {

    booking: DocumentReference,
    name: string,
    birthDate: Date,
    notes: string | null

}

export interface ClientDataMap extends SpaRadiseDataMap< ClientData > {

    [ clientId: string ]: ClientData

}

export interface EmployeeData extends SpaRadiseDocumentData {

    lastName: string,
    firstName: string,
    middleName: string,
    sex: sex,
    birthDate: Date,
    email: string,
    contactNumber: string,
    contactNumberAlternate: string | null,
    buildingNumber: string | null,
    street: string | null,
    barangay: string,
    city: string,
    province: string,
    region: string,
    zipCode: string,
    job: DocumentReference,
    jobStatus: jobStatus,
    hireDate: Date,
    unemploymentDate: Date | null,
    unemploymentReason: string | null

}

export interface EmployeeDataMap extends SpaRadiseDataMap< EmployeeData > {

    [ employeeId: string ]: EmployeeData

}

export interface EmployeeLeaveData extends SpaRadiseDocumentData {

    employee: DocumentReference,
    dateTimeStart: Date,
    dateTimeEnd: Date,
    status: leaveStatus,
    reason: string

}

export interface EmployeeLeaveDataMap extends SpaRadiseDataMap< EmployeeLeaveData > {

    [ employeeLeaveId: string ]: EmployeeLeaveData

}

export interface JobData extends SpaRadiseDocumentData {

    name: string,
    description: string

}

export interface JobDataMap extends SpaRadiseDataMap< JobData > {

    [ jobId: string ]: JobData

}

export interface JobServiceData extends SpaRadiseDocumentData {

    job: DocumentReference,
    service: DocumentReference

}

export interface JobServiceDataMap extends SpaRadiseDataMap< JobServiceData > {

    [ jobServiceId: string | number ]: JobServiceData

}

export interface PackageData extends SpaRadiseDocumentData {

    name: string,
    description: string

}

export interface PackageDataMap extends SpaRadiseDataMap< PackageData > {

    [ packageId: string ]: PackageData

}

export interface PackageMaintenanceData extends SpaRadiseDocumentData {

    package: DocumentReference,
    date: Date,
    price: number,
    status: packageMaintenanceStatus

}

export interface PackageMaintenanceDataMap extends SpaRadiseDataMap< PackageMaintenanceData > {

    [ packageMaintenanceId: string | number ]: PackageMaintenanceData

}

export interface PackageServiceData extends SpaRadiseDocumentData {

    package: DocumentReference,
    service: DocumentReference

}

export interface PackageServiceDataMap extends SpaRadiseDataMap< PackageServiceData > {

    [ packageServiceId: string | number ]: PackageServiceData

}

export interface ServiceData extends SpaRadiseDocumentData {

    name: string,
    description: string,
    serviceType: serviceType,
    roomType: roomType,
    ageLimit: number,
    durationMin: 30 | 60

}

export interface ServiceDataMap extends SpaRadiseDataMap< ServiceData > {

    [ serviceId: string ]: ServiceData

}

export interface ServiceMaintenanceData extends SpaRadiseDocumentData {

    service: DocumentReference,
    date: Date,
    price: number,
    commissionPercentage: number,
    status: serviceMaintenanceStatus

}

export interface ServiceMaintenanceDataMap extends SpaRadiseDataMap< ServiceMaintenanceData > {

    [ serviceMaintenanceId: string | number ]: ServiceMaintenanceData

}

export interface ServiceTransactionAvailabilityKeyMap {

    [ serviceTransactionId: documentId ]: {

        [ timeSlotId: string ]: boolean

    }

}

export interface ServiceTransactionData extends SpaRadiseDocumentData {

    client: DocumentReference,
    service: DocumentReference,
    package: DocumentReference | null,
    bookingDateTimeStart: Date,
    bookingDateTimeEnd: Date,
    actualBookingDateTimeStart: Date | null,
    actualBookingDateTimeEnd: Date | null,
    employee: DocumentReference | null,
    notes: string | null,
    status: serviceTransactionStatus

}

export interface ServiceTransactionDataMap extends SpaRadiseDataMap< ServiceTransactionData > {

    [ serviceTransactionId: string ]: ServiceTransactionData

}

export interface ServiceTransactionEmployeeListKeyMap {

    [ serviceTransactionId: string ]: documentId[]

}

export interface SpaRadiseDataMap< T extends SpaRadiseDocumentData > {

    [ documentId: objectKeyName ]: T

}

export interface SpaRadiseDocumentData {

    [ keyName: string ]: boolean | DocumentReference | Date | null | number | string

}

export interface SpaRadisePageData {

    loaded: boolean,
    popupData?: SpaRadisePopupData,
    updateMap: {
        [ documentId: string ]: {
            [ keyName: string ]: boolean
        }
    }

}

export interface SpaRadisePopupData {

    children: JSX.Element | JSX.Element[] | string,
    popupMode?: popupMode,
    noText?: string,
    yesText?: string,
    no?(): Promise< void > | void,
    yes?(): Promise< void > | void

}

export interface VoucherData extends SpaRadiseDocumentData {

    name: string,
    code: string,
    amount: number | null,
    percentage: number | null,
    dateValid: Date,
    dateExpiry: Date

}

export interface VoucherDataMap extends SpaRadiseDataMap< VoucherData > {

    [ voucherId: string ]: VoucherData

}

export interface VoucherPackageData extends SpaRadiseDocumentData {

    voucher: DocumentReference,
    package: DocumentReference

}

export interface VoucherPackageDataMap extends SpaRadiseDataMap< VoucherPackageData > {

    [ voucherPackageId: string | number ]: VoucherPackageData

}

export interface VoucherServiceData extends SpaRadiseDocumentData {

    voucher: DocumentReference,
    service: DocumentReference

}

export interface VoucherServiceDataMap extends SpaRadiseDataMap< VoucherServiceData > {

    [ voucherServiceId: string | number ]: VoucherServiceData

}

export interface VoucherTransactionApplicationMap {

    [ voucherTransactionId: documentId ]: documentId | undefined

}

export interface VoucherTransactionData extends SpaRadiseDocumentData {

    voucher: DocumentReference,
    booking: DocumentReference,
    status: voucherStatus

}

export interface VoucherTransactionDataMap extends SpaRadiseDataMap< VoucherTransactionData > {

    [ voucherTransactioneId: string ]: VoucherTransactionData

}
