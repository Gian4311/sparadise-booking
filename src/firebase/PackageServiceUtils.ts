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
    PackageServiceData,
    PackageServiceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class PackageServiceUtils {

    public static async checkPackageServiceData(
        packageServiceData: PackageServiceData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT
            } = SpaRadiseEnv,
            {
                date, price, commissionPercentage, status
            } = packageServiceData
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

    public static async createPackageService(
        packageServiceData: PackageServiceData
    ): Promise< DocumentReference > {
    
        await PackageServiceUtils.checkPackageServiceData( packageServiceData );
        const
            packageServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.PACKAGE_SERVICE_COLLECTION )
            ,
            documentReference = await addDoc(
                packageServiceCollection, packageServiceData
            )
        ;
        return documentReference;

    }

    public static async deletePackageService(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PACKAGE_SERVICE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getPackageServiceData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PackageServiceData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.PACKAGE_SERVICE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            package: data.package,
            service: data.service
        };

    }

    public static async getPackageServiceDataMapAll(): Promise< PackageServiceDataMap > {
        
        const
            packageServiceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.PACKAGE_SERVICE_COLLECTION
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( packageServiceCollection ) ).docs,
            packageServiceDataMap: PackageServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            packageServiceDataMap[ snapshot.id ] = await PackageServiceUtils.getPackageServiceData(
                snapshot
            );
        return packageServiceDataMap;

    }

    public static async getPackageServiceListByPackage(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PackageServiceDataMap > {
    
        const
            packageServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.PACKAGE_SERVICE_COLLECTION )
            ,
            packageReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.PACKAGE_COLLECTION
            ),
            packageServiceQuery = query(
                packageServiceCollection,
                where( "package", "==", packageReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( packageServiceQuery ) ).docs
            ,
            packageServiceDataMap: PackageServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            packageServiceDataMap[ snapshot.id ] =
                await PackageServiceUtils.getPackageServiceData( snapshot )
            ;
        return packageServiceDataMap;

    }

    public static async updatePackageService(
        by: documentId | DocumentReference | DocumentSnapshot,
        packageServiceData: PackageServiceData
    ): Promise< boolean > {

        await PackageServiceUtils.checkPackageServiceData( packageServiceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PACKAGE_SERVICE_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, packageServiceData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
