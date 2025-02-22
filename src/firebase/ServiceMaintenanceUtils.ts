import {
    addDoc,
    CollectionReference,
    deleteDoc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    getDocs,
    query,
    updateDoc,
    QueryDocumentSnapshot,
    WithFieldValue,
    where
} from "firebase/firestore/lite";
import {
    ServiceMaintenanceData,
    ServiceMaintenanceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class ServiceMaintenanceUtils {

    public static async checkServiceMaintenanceData(
        serviceMaintenanceData: ServiceMaintenanceData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT,
                SERVICE_DURATION_MIN_RANGE
            } = SpaRadiseEnv,
            {
                service, date, price, commissionPercentage, status
            } = serviceMaintenanceData
        ;

        try {

            // if date is past
            // price filters
            // commission percentage
            // status is wrong type

        } catch( error ) {

            throw error;

        }
        return true;

    }

    public static async createServiceMaintenance(
        serviceMaintenanceData: ServiceMaintenanceData
    ): Promise< DocumentReference > {
    
        await ServiceMaintenanceUtils.checkServiceMaintenanceData( serviceMaintenanceData );
        const
            serviceMaintenanceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_MAINTENANCE_COLLECTION )
            ,
            documentReference = await addDoc(
                serviceMaintenanceCollection, serviceMaintenanceData
            )
        ;
        return documentReference;

    }

    public static async deleteServiceMaintenance(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.SERVICE_MAINTENANCE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getServiceMaintenanceData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ServiceMaintenanceData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.SERVICE_MAINTENANCE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            service: data.service,
            date: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "date" ),
            price: data.price,
            commissionPercentage: data.commissionPercentage,
            status: data.status
        };

    }

    public static async getServiceMaintenanceListByService(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ServiceMaintenanceDataMap > {
    
        const
            serviceMaintenanceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_MAINTENANCE_COLLECTION )
            ,
            serviceReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.SERVICE_COLLECTION
            ),
            serviceMaintenanceQuery = query(
                serviceMaintenanceCollection,
                where( "service", "==", serviceReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( serviceMaintenanceQuery ) ).docs
            ,
            serviceMaintenanceDataMap: ServiceMaintenanceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            serviceMaintenanceDataMap[ snapshot.id ] =
                await ServiceMaintenanceUtils.getServiceMaintenanceData( snapshot )
            ;
        return serviceMaintenanceDataMap;

    }

    public static async updateServiceMaintenance(
        by: documentId | DocumentReference | DocumentSnapshot,
        serviceMaintenanceData: ServiceMaintenanceData
    ): Promise< boolean > {

        await ServiceMaintenanceUtils.checkServiceMaintenanceData( serviceMaintenanceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.SERVICE_MAINTENANCE_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, serviceMaintenanceData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
