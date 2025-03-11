import {
    addDoc,
    CollectionReference,
    deleteDoc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    getDocs,
    orderBy,
    QueryDocumentSnapshot,
    query,
    updateDoc,
    WithFieldValue
} from "firebase/firestore/lite";
import {
    BookingData,
    BookingDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class BookingUtils {

    public static async checkBookingData( accountData: BookingData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = accountData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isBookingType( accountData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( accountData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( accountData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( accountData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( accountData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( accountData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( accountData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( accountData.name )
        //     && StringUtils.isText( accountData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( accountData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( accountData.roomType )
        //     && NumberUtils.isNaturalNumber( accountData.ageLimit )
        //     && accountData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( accountData.durationMin )
        //     && accountData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createBooking( accountData: BookingData ): Promise< DocumentReference > {
    
        await BookingUtils.checkBookingData( accountData );
        const
            accountCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.ACCOUNT_COLLECTION
            ),
            documentReference = await addDoc( accountCollection, accountData )
        ;
        return documentReference;

    }

    public static async deleteBooking(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getBookingData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< BookingData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            account: data.account,
            reservedDateTime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "reservedDateTime" ),
            activeDateTime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "activeDateTime" ),
            finishedDateTime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "finishedDateTime" ),
            canceledDateTime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "canceledDateTime" ),
        };

    }

    public static async getBookingListAll(): Promise< BookingDataMap > {
    
        const
            accountCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.ACCOUNT_COLLECTION
            ),
            accountQuery = query(
                accountCollection,
                orderBy( "name" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( accountQuery ) ).docs,
            accountDataMap: BookingDataMap = {}
        ;
        for( let snapshot of snapshotList )
            accountDataMap[ snapshot.id ] = await BookingUtils.getBookingData( snapshot );
        return accountDataMap;

    }

    public static async updateBooking(
        by: documentId | DocumentReference | DocumentSnapshot,
        accountData: BookingData
    ): Promise< boolean > {

        await BookingUtils.checkBookingData( accountData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.ACCOUNT_COLLECTION
        );
        try {

            await updateDoc( documentReference, accountData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
