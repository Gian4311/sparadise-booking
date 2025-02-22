import { DocumentReference } from "firebase/firestore/lite";

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
