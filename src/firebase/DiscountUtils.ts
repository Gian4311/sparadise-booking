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
    DiscountData,
    DiscountDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class DiscountUtils {

    public static async checkDiscountData( discountData: DiscountData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = discountData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isDiscountType( discountData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( discountData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( discountData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( discountData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( discountData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( discountData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( discountData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( discountData.name )
        //     && StringUtils.isText( discountData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( discountData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( discountData.roomType )
        //     && NumberUtils.isNaturalNumber( discountData.ageLimit )
        //     && discountData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( discountData.durationMin )
        //     && discountData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createDiscount( discountData: DiscountData ): Promise< DocumentReference > {
    
        await DiscountUtils.checkDiscountData( discountData );
        const
            discountCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.DISCOUNT_COLLECTION
            ),
            documentReference = await addDoc( discountCollection, discountData )
        ;
        return documentReference;

    }

    public static async deleteDiscount(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.DISCOUNT_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getDiscountData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< DiscountData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.DISCOUNT_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            booking: data.booking,
            discountType: data.discountType,
            amount: data.amount,
            percentage: data.percentage,
            status: data.status
        };

    }

    public static async getDiscountDataMapAll(): Promise< DiscountDataMap > {
    
        const
            discountCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.DISCOUNT_COLLECTION
            ),
            discountQuery = query( discountCollection ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( discountQuery ) ).docs,
            discountDataMap: DiscountDataMap = {}
        ;
        for( let snapshot of snapshotList )
            discountDataMap[ snapshot.id ] = await DiscountUtils.getDiscountData( snapshot );
        return discountDataMap;

    }

    public static async getDiscountDataMapByBooking(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< DiscountDataMap > {
    
        const
            discountCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.DISCOUNT_COLLECTION )
            ,
            bookingReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.BOOKING_COLLECTION
            ),
            discountQuery = query(
                discountCollection,
                where( "booking", "==", bookingReference )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( discountQuery ) ).docs,
            discountDataMap: DiscountDataMap = {}
        ;
        for( let snapshot of snapshotList )
            discountDataMap[ snapshot.id ] =
                await DiscountUtils.getDiscountData( snapshot )
            ;
        return discountDataMap;

    }

    public static async updateDiscount(
        by: documentId | DocumentReference | DocumentSnapshot,
        discountData: DiscountData
    ): Promise< boolean > {

        await DiscountUtils.checkDiscountData( discountData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.DISCOUNT_COLLECTION
        );
        try {

            await updateDoc( documentReference, discountData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
