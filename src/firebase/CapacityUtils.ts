import {
    addDoc,
    CollectionReference,
    deleteDoc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    getDocs,
    orderBy,
    query,
    updateDoc,
    QueryDocumentSnapshot,
    WithFieldValue,
    where
} from "firebase/firestore/lite";
import DateUtils from "../utils/DateUtils";
import {
    CapacityData,
    CapacityDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class CapacityUtils {

    public static async checkCapacityData(
        capacityData: CapacityData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT,
                SERVICE_DURATION_MIN_RANGE
            } = SpaRadiseEnv,
            {
                service, date, price, commissionPercentage, status
            } = capacityData
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

    public static async createCapacity(
        capacityData: CapacityData
    ): Promise< DocumentReference > {
    
        await CapacityUtils.checkCapacityData( capacityData );
        const
            capacityCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.CAPACITY_COLLECTION )
            ,
            documentReference = await addDoc(
                capacityCollection, capacityData
            )
        ;
        return documentReference;

    }

    public static async deleteCapacity(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.CAPACITY_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getCapacityData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< CapacityData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.CAPACITY_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            roomCount: data.roomCount,
            chairCount: data.chairCount,
            datetime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "datetime" )
        };

    }

    public static async getCapacityDataMapAll(): Promise< CapacityDataMap > {
        
        const
            capacityCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.CAPACITY_COLLECTION
            ),
            capacityQuery = query(
                capacityCollection,
                orderBy( "datetime", "desc" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( capacityQuery ) ).docs,
            capacityDataMap: CapacityDataMap = {}
        ;
        for( let snapshot of snapshotList )
            capacityDataMap[ snapshot.id ] = await CapacityUtils.getCapacityData( snapshot );
        return capacityDataMap;

    }

    public static async getCapacityDataByDate(
        date: Date
    ): Promise< CapacityData | undefined > {
        
        const
            capacityCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.CAPACITY_COLLECTION )
            ,
            capacityQuery = query(
                capacityCollection,
                where( "datetime", "<=", date ),
                orderBy( "datetime", "desc" )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( capacityQuery ) ).docs
        ;
        if( snapshotList.length === 0 ) return undefined;
        return await CapacityUtils.getCapacityData( snapshotList[ 0 ] );

    }

    public static async getCapacityDataMapByDate(
        date: Date
    ): Promise< CapacityDataMap > {
        
        const
            capacityCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.CAPACITY_COLLECTION )
            ,
            capacityQuery = query(
                capacityCollection,
                where( "datetime", "<=", DateUtils.toCeilByDay( date ) ),
                orderBy( "datetime", "desc" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( capacityQuery ) ).docs,
            capacityDataMap: CapacityDataMap = {}
        ;
        for( let snapshot of snapshotList )
            capacityDataMap[ snapshot.id ] = await CapacityUtils.getCapacityData( snapshot );
        return capacityDataMap;

    }

    public static async updateCapacity(
        by: documentId | DocumentReference | DocumentSnapshot,
        capacityData: CapacityData
    ): Promise< boolean > {

        await CapacityUtils.checkCapacityData( capacityData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.CAPACITY_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, capacityData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
