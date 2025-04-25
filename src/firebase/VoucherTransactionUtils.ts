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
    VoucherTransactionData,
    VoucherTransactionDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class VoucherTransactionUtils {

    public static async checkVoucherTransactionData(
        voucherServiceData: VoucherTransactionData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT
            } = SpaRadiseEnv,
            {
                date, price, commissionPercentage, status
            } = voucherServiceData
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

    public static async createVoucherTransaction(
        voucherServiceData: VoucherTransactionData
    ): Promise< DocumentReference > {
    
        await VoucherTransactionUtils.checkVoucherTransactionData( voucherServiceData );
        const
            voucherServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION )
            ,
            documentReference = await addDoc(
                voucherServiceCollection, voucherServiceData
            )
        ;
        return documentReference;

    }

    public static async deleteVoucherTransaction(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getVoucherTransactionData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherTransactionData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            voucher: data.voucher,
            booking: data.booking,
            status: data.status
        };

    }

    public static async getVoucherTransactionDataMapAll(): Promise< VoucherTransactionDataMap > {
        
        const
            voucherServiceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( voucherServiceCollection ) ).docs,
            voucherTransactionDataMap: VoucherTransactionDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherTransactionDataMap[ snapshot.id ] = await VoucherTransactionUtils.getVoucherTransactionData( snapshot );
        return voucherTransactionDataMap;

    }

    public static async getVoucherTransactionDataMapByBooking(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherTransactionDataMap > {
    
        const
            voucherTransactionCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION )
            ,
            bookingReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.BOOKING_COLLECTION
            ),
            voucherTransactionQuery = query(
                voucherTransactionCollection,
                where( "booking", "==", bookingReference )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( voucherTransactionQuery ) ).docs,
            voucherTransactionDataMap: VoucherTransactionDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherTransactionDataMap[ snapshot.id ] =
                await VoucherTransactionUtils.getVoucherTransactionData( snapshot )
            ;
        return voucherTransactionDataMap;

    }

    public static async getVoucherTransactionDataMapByVoucher(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherTransactionDataMap > {
    
        const
            voucherServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION )
            ,
            voucherReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.VOUCHER_COLLECTION
            ),
            voucherServiceQuery = query(
                voucherServiceCollection,
                where( "voucher", "==", voucherReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( voucherServiceQuery ) ).docs
            ,
            voucherServiceDataMap: VoucherTransactionDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherServiceDataMap[ snapshot.id ] =
                await VoucherTransactionUtils.getVoucherTransactionData( snapshot )
            ;
        return voucherServiceDataMap;

    }

    public static async updateVoucherTransaction(
        by: documentId | DocumentReference | DocumentSnapshot,
        voucherServiceData: VoucherTransactionData
    ): Promise< boolean > {

        await VoucherTransactionUtils.checkVoucherTransactionData( voucherServiceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_TRANSACTION_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, voucherServiceData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
