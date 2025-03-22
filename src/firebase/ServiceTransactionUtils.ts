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
    ServiceTransactionData,
    ServiceTransactionDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class ServiceTransactionUtils {

    public static async checkServiceTransactionData(
        serviceTransactionData: ServiceTransactionData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT,
                SERVICE_DURATION_MIN_RANGE
            } = SpaRadiseEnv,
            {
                service, date, price, commissionPercentage, status
            } = serviceTransactionData
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

    public static async createServiceTransaction(
        serviceTransactionData: ServiceTransactionData
    ): Promise< DocumentReference > {
    
        await ServiceTransactionUtils.checkServiceTransactionData( serviceTransactionData );
        const
            serviceTransactionCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION )
            ,
            documentReference = await addDoc(
                serviceTransactionCollection, serviceTransactionData
            )
        ;
        return documentReference;

    }

    public static async deleteServiceTransaction(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getServiceTransactionData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ServiceTransactionData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            client: data.client,
            service: data.service,
            package: data.package,
            status: data.status,
            bookingFromDateTime: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "bookingFromDateTime"
            ),
            bookingToDateTime: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "bookingToDateTime"
            ),
            actualBookingFromDateTime: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "actualBookingFromDateTime"
            ),
            actualBookingToDateTime: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "actualBookingToDateTime"
            ),
            employee: data.employee,
            notes: data.notes
            
        };

    }

    public static async getServiceTransactionDataMapByClient(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ServiceTransactionDataMap > {
    
        const
            serviceTransactionCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION )
            ,
            clientReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.CLIENT_COLLECTION
            ),
            serviceTransactionQuery = query(
                serviceTransactionCollection,
                where( "service", "==", clientReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( serviceTransactionQuery ) ).docs
            ,
            serviceTransactionDataMap: ServiceTransactionDataMap = {}
        ;
        for( let snapshot of snapshotList )
            serviceTransactionDataMap[ snapshot.id ] =
                await ServiceTransactionUtils.getServiceTransactionData( snapshot )
            ;
        return serviceTransactionDataMap;

    }

    public static async getServiceTransactionDataMapByService(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ServiceTransactionDataMap > {
    
        const
            serviceTransactionCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION )
            ,
            serviceReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.SERVICE_COLLECTION
            ),
            serviceTransactionQuery = query(
                serviceTransactionCollection,
                where( "service", "==", serviceReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( serviceTransactionQuery ) ).docs
            ,
            serviceTransactionDataMap: ServiceTransactionDataMap = {}
        ;
        for( let snapshot of snapshotList )
            serviceTransactionDataMap[ snapshot.id ] =
                await ServiceTransactionUtils.getServiceTransactionData( snapshot )
            ;
        return serviceTransactionDataMap;

    }

    public static async updateServiceTransaction(
        by: documentId | DocumentReference | DocumentSnapshot,
        serviceTransactionData: ServiceTransactionData
    ): Promise< boolean > {

        await ServiceTransactionUtils.checkServiceTransactionData( serviceTransactionData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, serviceTransactionData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
