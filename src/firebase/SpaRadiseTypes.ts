import { DocumentReference } from "firebase/firestore/lite";

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

    updateMap: {
        [ documentId: string ]: {
            [ keyName: string ]: boolean
        }
    }

}
