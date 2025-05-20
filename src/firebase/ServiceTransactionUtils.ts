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
import DateUtils from "../utils/DateUtils";
import {
    ClientDataMap,
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
            bookingDateTimeStart: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "bookingDateTimeStart"
            ),
            bookingDateTimeEnd: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "bookingDateTimeEnd"
            ),
            actualBookingDateTimeStart: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "actualBookingDateTimeStart"
            ),
            actualBookingDateTimeEnd: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "actualBookingDateTimeEnd"
            ),
            employee: data.employee,
            notes: data.notes,
            status: data.status
            
        };

    }

    public static async getServiceTransactionDataMapByClientDataMap(
        clientDataMap: ClientDataMap
    ): Promise< ServiceTransactionDataMap > {
    
        const
            serviceTransactionCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION )
            ,
            clientReferenceList: DocumentReference[] = Object.keys( clientDataMap ).map(
                clientId => SpaRadiseFirestore.getDocumentReference(
                    clientId, SpaRadiseEnv.CLIENT_COLLECTION
                )
            )
        ;
        const
            serviceTransactionQuery = query(
                serviceTransactionCollection,
                where( "client", "in", clientReferenceList )
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
            clientTransactionQuery = query(
                serviceTransactionCollection,
                where( "client", "==", clientReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( clientTransactionQuery ) ).docs
            ,
            serviceTransactionDataMap: ServiceTransactionDataMap = {}
        ;
        for( let snapshot of snapshotList )
            serviceTransactionDataMap[ snapshot.id ] =
                await ServiceTransactionUtils.getServiceTransactionData( snapshot )
            ;
        return serviceTransactionDataMap;

    }

    public static async getServiceTransactionDataMapByDay(
        date: Date,
        ignoreCanceled: boolean = true,
        clientIgnoreDataMap?: ClientDataMap
    ): Promise< ServiceTransactionDataMap > {
    
        const
            serviceTransactionCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.SERVICE_TRANSACTION_COLLECTION )
            ,
            dateTimeStart: Date = DateUtils.toFloorByDay( date ),
            dateTimeEnd: Date = DateUtils.toCeilByDay( date ),
            clientIgnoreReferenceList: DocumentReference[] =
                clientIgnoreDataMap ? Object.keys( clientIgnoreDataMap ).map(
                    clientId => SpaRadiseFirestore.getDocumentReference(
                        clientId, SpaRadiseEnv.CLIENT_COLLECTION
                    )
                ) : []
            ,
            queryList = [
                where( "bookingDateTimeStart", "<", dateTimeEnd ),
                where( "bookingDateTimeEnd", ">", dateTimeStart )
            ]
        ;
        if( ignoreCanceled )
            queryList.push( where( "canceled", "==", false ) );
        if( clientIgnoreReferenceList.length > 0 )
            queryList.push( where( "client", "not-in", clientIgnoreReferenceList ) );
        const
            serviceTransactionQuery = query( serviceTransactionCollection, ...queryList ),
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
