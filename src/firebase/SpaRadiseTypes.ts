import { DocumentReference } from "firebase/firestore/lite";

export interface AccountData extends SpaRadiseDocumentData {

    lastName: string,
    firstName: string,
    middleName: string | null,
    sex: sex,
    birthDate: Date,
    email: string,
    contactNumber: string,
    contactNumberAlternate: string | null

}

export interface AccountDataMap {

    [ accountId: string ]: AccountData

}

export interface BookingData extends SpaRadiseDocumentData {

    account: DocumentReference,
    reservedDateTime: Date,
    activeDateTime: Date | null,
    finishedDateTime: Date | null,
    canceledDateTime: Date | null

}

export interface BookingDataMap {

    [ bookingId: string ]: BookingData

}

export interface ClientData extends SpaRadiseDocumentData {

    booking: DocumentReference,
    name: string,
    birthDate: Date,
    notes: string | null

}

export interface ClientDataMap {

    [ clientId: string ]: ClientData

}

export interface JobData extends SpaRadiseDocumentData {

    name: string,
    description: string

}

export interface JobDataMap {

    [ jobId: string ]: JobData

}

export interface JobServiceData extends SpaRadiseDocumentData {

    job: DocumentReference,
    service: DocumentReference

}

export interface JobServiceDataMap {

    [ jobServiceId: string | number ]: JobServiceData

}

export interface PackageData extends SpaRadiseDocumentData {

    name: string,
    description: string

}

export interface PackageDataMap {

    [ packageId: string ]: PackageData

}

export interface PackageMaintenanceData extends SpaRadiseDocumentData {

    package: DocumentReference,
    date: Date,
    price: number,
    status: packageMaintenanceStatus

}

export interface PackageMaintenanceDataMap {

    [ packageMaintenanceId: string | number ]: PackageMaintenanceData

}

export interface PackageServiceData extends SpaRadiseDocumentData {

    package: DocumentReference,
    service: DocumentReference

}

export interface PackageServiceDataMap {

    [ packageServiceId: string | number ]: PackageServiceData

}

export interface ServiceData extends SpaRadiseDocumentData {

    name: string,
    description: string,
    serviceType: serviceType,
    roomType: roomType,
    ageLimit: number,
    durationMin: number

}

export interface ServiceDataMap {

    [ serviceId: string ]: ServiceData

}

export interface ServiceMaintenanceData extends SpaRadiseDocumentData {

    service: DocumentReference,
    date: Date,
    price: number,
    commissionPercentage: number,
    status: serviceMaintenanceStatus

}

export interface ServiceMaintenanceDataMap {

    [ serviceMaintenanceId: string | number ]: ServiceMaintenanceData

}

export interface SpaRadiseDocumentData {

    [ keyName: string ]: boolean | DocumentReference | Date | null | number | string

}

export interface SpaRadisePageData {

    loaded: boolean,
    updateMap: {
        [ documentId: string ]: {
            [ keyName: string ]: boolean
        }
    }

}

export interface EmployeeData extends SpaRadiseDocumentData {

    lastName: string,
    firstName: string,
    middleName: string,
    sex: "male" | "female" | "others",
    email: string,
    contactNumber: string,
    contactNumberAlternate: string | null,
    buildingNumber: string | null,
    streetName: string | null,
    barangay: string,
    city: string,
    province: string,
    region: string,
    postalCode: string,
    jobStatus: string,
    hireDate:  Date | null,
    unemploymentDate: Date | null,
    unemploymentReason: string | null

}

export interface EmployeeDataMap {

    [ employeeID: string ]: EmployeeData

}

export interface VoucherData extends SpaRadiseDocumentData {

    name: string,
    code: string,
    amount: number | null,
    percentage: number | null

}

export interface VoucherDataMap {

    [ voucherId: string ]: VoucherData

}

export interface VoucherPackageData extends SpaRadiseDocumentData {

    voucher: DocumentReference,
    package: DocumentReference

}

export interface VoucherPackageDataMap {

    [ voucherPackageId: string | number ]: VoucherPackageData

}

export interface VoucherServiceData extends SpaRadiseDocumentData {

    voucher: DocumentReference,
    service: DocumentReference

}

export interface VoucherServiceDataMap {

    [ voucherServiceId: string | number ]: VoucherServiceData

}
