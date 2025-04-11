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
    VoucherData,
    VoucherDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class VoucherUtils {

    public static async checkVoucherData( voucherData: VoucherData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = voucherData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isVoucherType( voucherData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( voucherData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( voucherData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( voucherData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( voucherData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( voucherData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( voucherData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( voucherData.name )
        //     && StringUtils.isText( voucherData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( voucherData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( voucherData.roomType )
        //     && NumberUtils.isNaturalNumber( voucherData.ageLimit )
        //     && voucherData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( voucherData.durationMin )
        //     && voucherData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createVoucher( voucherData: VoucherData ): Promise< DocumentReference > {
    
        await VoucherUtils.checkVoucherData( voucherData );
        const
            voucherCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.VOUCHER_COLLECTION
            ),
            documentReference = await addDoc( voucherCollection, voucherData )
        ;
        return documentReference;

    }

    public static async deleteVoucher(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getVoucherData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.VOUCHER_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            name: data.name,
            code: data.code,
            amount: data.amount,
            percentage: data.percentage,
            dateValid: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "dateValid"
            ),
            dateExpiry: SpaRadiseFirestore.getDateFromSnapshot(
                snapshot, "dateExpiry"
            )
        };

    }

    public static async getVoucherDataMapAll(): Promise< VoucherDataMap > {
    
        const
            voucherCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.VOUCHER_COLLECTION
            ),
            voucherQuery = query(
                voucherCollection,
                orderBy( "name" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( voucherQuery ) ).docs,
            voucherDataMap: VoucherDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherDataMap[ snapshot.id ] = await VoucherUtils.getVoucherData( snapshot );
        return voucherDataMap;

    }

    public static async updateVoucher(
        by: documentId | DocumentReference | DocumentSnapshot,
        voucherData: VoucherData
    ): Promise< boolean > {

        await VoucherUtils.checkVoucherData( voucherData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_COLLECTION
        );
        try {

            await updateDoc( documentReference, voucherData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
