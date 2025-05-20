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
    PaymentData,
    PaymentDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class PaymentUtils {

    public static async checkPaymentData( paymentData: PaymentData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = paymentData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isPaymentType( paymentData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( paymentData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( paymentData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( paymentData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( paymentData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( paymentData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( paymentData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( paymentData.name )
        //     && StringUtils.isText( paymentData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( paymentData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( paymentData.roomType )
        //     && NumberUtils.isNaturalNumber( paymentData.ageLimit )
        //     && paymentData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( paymentData.durationMin )
        //     && paymentData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createPayment( paymentData: PaymentData ): Promise< DocumentReference > {
    
        await PaymentUtils.checkPaymentData( paymentData );
        const
            paymentCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.PAYMENT_COLLECTION
            ),
            documentReference = await addDoc( paymentCollection, paymentData )
        ;
        return documentReference;

    }

    public static async deletePayment(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PAYMENT_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getPaymentData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PaymentData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.PAYMENT_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            booking: data.booking,
            amount: data.amount,
            gcashReference: data.gcashReference,
            status: data.status
        };

    }

    public static async getPaymentDataMapAll(): Promise< PaymentDataMap > {
    
        const
            paymentCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.PAYMENT_COLLECTION
            ),
            paymentQuery = query( paymentCollection ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( paymentQuery ) ).docs,
            paymentDataMap: PaymentDataMap = {}
        ;
        for( let snapshot of snapshotList )
            paymentDataMap[ snapshot.id ] = await PaymentUtils.getPaymentData( snapshot );
        return paymentDataMap;

    }

    public static async getPaymentDataMapByBooking(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PaymentDataMap > {
    
        const
            paymentCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.PAYMENT_COLLECTION )
            ,
            bookingReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.BOOKING_COLLECTION
            ),
            paymentQuery = query(
                paymentCollection,
                where( "booking", "==", bookingReference )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( paymentQuery ) ).docs,
            paymentDataMap: PaymentDataMap = {}
        ;
        for( let snapshot of snapshotList )
            paymentDataMap[ snapshot.id ] =
                await PaymentUtils.getPaymentData( snapshot )
            ;
        return paymentDataMap;

    }

    public static async updatePayment(
        by: documentId | DocumentReference | DocumentSnapshot,
        paymentData: PaymentData
    ): Promise< boolean > {

        await PaymentUtils.checkPaymentData( paymentData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PAYMENT_COLLECTION
        );
        try {

            await updateDoc( documentReference, paymentData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
