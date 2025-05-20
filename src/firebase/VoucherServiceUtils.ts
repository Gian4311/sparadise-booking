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
    VoucherServiceData,
    VoucherServiceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class VoucherServiceUtils {

    public static async checkVoucherServiceData(
        voucherServiceData: VoucherServiceData
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

    public static async createVoucherService(
        voucherServiceData: VoucherServiceData
    ): Promise< DocumentReference > {
    
        await VoucherServiceUtils.checkVoucherServiceData( voucherServiceData );
        const
            voucherServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_SERVICE_COLLECTION )
            ,
            documentReference = await addDoc(
                voucherServiceCollection, voucherServiceData
            )
        ;
        return documentReference;

    }

    public static async deleteVoucherService(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_SERVICE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getVoucherServiceData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherServiceData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.VOUCHER_SERVICE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            voucher: data.voucher,
            service: data.service
        };

    }

    public static async getVoucherServiceDataMapAll(): Promise< VoucherServiceDataMap > {
        
        const
            voucherServiceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.VOUCHER_SERVICE_COLLECTION
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( voucherServiceCollection ) ).docs,
            voucherServiceDataMap: VoucherServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherServiceDataMap[ snapshot.id ] = await VoucherServiceUtils.getVoucherServiceData( snapshot );
        return voucherServiceDataMap;

    }

    public static async getVoucherServiceDataMapByVoucher(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherServiceDataMap > {
    
        const
            voucherServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_SERVICE_COLLECTION )
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
            voucherServiceDataMap: VoucherServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherServiceDataMap[ snapshot.id ] =
                await VoucherServiceUtils.getVoucherServiceData( snapshot )
            ;
        return voucherServiceDataMap;

    }

    public static async updateVoucherService(
        by: documentId | DocumentReference | DocumentSnapshot,
        voucherServiceData: VoucherServiceData
    ): Promise< boolean > {

        await VoucherServiceUtils.checkVoucherServiceData( voucherServiceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_SERVICE_COLLECTION
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
