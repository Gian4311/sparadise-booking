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
    VoucherPackageData,
    VoucherPackageDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class VoucherPackageUtils {

    public static async checkVoucherPackageData(
        voucherPackageData: VoucherPackageData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT
            } = SpaRadiseEnv,
            {
                date, price, commissionPercentage, status
            } = voucherPackageData
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

    public static async createVoucherPackage(
        voucherPackageData: VoucherPackageData
    ): Promise< DocumentReference > {
    
        await VoucherPackageUtils.checkVoucherPackageData( voucherPackageData );
        const
            voucherPackageCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_PACKAGE_COLLECTION )
            ,
            documentReference = await addDoc(
                voucherPackageCollection, voucherPackageData
            )
        ;
        return documentReference;

    }

    public static async deleteVoucherPackage(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_PACKAGE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getVoucherPackageData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherPackageData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.VOUCHER_PACKAGE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            voucher: data.voucher,
            package: data.package
        };

    }

    public static async getVoucherPackageListByVoucher(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< VoucherPackageDataMap > {
    
        const
            voucherPackageCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.VOUCHER_PACKAGE_COLLECTION )
            ,
            voucherReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.VOUCHER_COLLECTION
            ),
            voucherPackageQuery = query(
                voucherPackageCollection,
                where( "voucher", "==", voucherReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( voucherPackageQuery ) ).docs
            ,
            voucherPackageDataMap: VoucherPackageDataMap = {}
        ;
        for( let snapshot of snapshotList )
            voucherPackageDataMap[ snapshot.id ] =
                await VoucherPackageUtils.getVoucherPackageData( snapshot )
            ;
        return voucherPackageDataMap;

    }

    public static async updateVoucherPackage(
        by: documentId | DocumentReference | DocumentSnapshot,
        voucherPackageData: VoucherPackageData
    ): Promise< boolean > {

        await VoucherPackageUtils.checkVoucherPackageData( voucherPackageData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.VOUCHER_PACKAGE_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, voucherPackageData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
