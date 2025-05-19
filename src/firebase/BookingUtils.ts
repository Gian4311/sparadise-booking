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
    WithFieldValue,
    where
} from "firebase/firestore/lite";
import {
    BookingData,
    BookingDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class BookingUtils {

    public static async checkBookingData( bookingData: BookingData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = bookingData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isBookingType( bookingData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( bookingData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( bookingData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( bookingData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( bookingData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( bookingData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( bookingData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( bookingData.name )
        //     && StringUtils.isText( bookingData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( bookingData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( bookingData.roomType )
        //     && NumberUtils.isNaturalNumber( bookingData.ageLimit )
        //     && bookingData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( bookingData.durationMin )
        //     && bookingData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createBooking( bookingData: BookingData ): Promise< DocumentReference > {
    
        await BookingUtils.checkBookingData( bookingData );
        const
            bookingCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.BOOKING_COLLECTION
            ),
            documentReference = await addDoc( bookingCollection, bookingData )
        ;
        return documentReference;

    }

    public static async deleteBooking(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.BOOKING_COLLECTION
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
            by, SpaRadiseEnv.BOOKING_COLLECTION
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

    public static async getBookingDataMapAll(): Promise< BookingDataMap > {
    
        const
            bookingCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.BOOKING_COLLECTION
            ),
            bookingQuery = query( bookingCollection ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( bookingQuery ) ).docs,
            bookingDataMap: BookingDataMap = {}
        ;
        for( let snapshot of snapshotList )
            bookingDataMap[ snapshot.id ] = await BookingUtils.getBookingData( snapshot );
        return bookingDataMap;

    }

    public static async getBookingDataMapByAccount(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< BookingDataMap > {
    
        const
            bookingCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.BOOKING_COLLECTION )
            ,
            accountReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.ACCOUNT_COLLECTION
            ),
            bookingQuery = query(
                bookingCollection,
                where( "account", "==", accountReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( bookingQuery ) ).docs
            ,
            bookingDataMap: BookingDataMap = {}
        ;
        for( let snapshot of snapshotList )
            bookingDataMap[ snapshot.id ] =
                await BookingUtils.getBookingData( snapshot )
            ;
        return bookingDataMap;

    }

    public static async updateBooking(
        by: documentId | DocumentReference | DocumentSnapshot,
        bookingData: BookingData
    ): Promise< boolean > {

        await BookingUtils.checkBookingData( bookingData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.BOOKING_COLLECTION
        );
        try {

            await updateDoc( documentReference, bookingData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
