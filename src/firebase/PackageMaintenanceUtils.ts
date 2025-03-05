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
    PackageMaintenanceData,
    PackageMaintenanceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class PackageMaintenanceUtils {

    public static async checkPackageMaintenanceData(
        packageMaintenanceData: PackageMaintenanceData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT
            } = SpaRadiseEnv,
            {
                date, price, commissionPercentage, status
            } = packageMaintenanceData
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

    public static async createPackageMaintenance(
        packageMaintenanceData: PackageMaintenanceData
    ): Promise< DocumentReference > {
    
        await PackageMaintenanceUtils.checkPackageMaintenanceData( packageMaintenanceData );
        const
            packageMaintenanceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.PACKAGE_MAINTENANCE_COLLECTION )
            ,
            documentReference = await addDoc(
                packageMaintenanceCollection, packageMaintenanceData
            )
        ;
        return documentReference;

    }

    public static async deletePackageMaintenance(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PACKAGE_MAINTENANCE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getPackageMaintenanceData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PackageMaintenanceData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.PACKAGE_MAINTENANCE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            package: data.package,
            date: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "date" ),
            price: data.price,
            status: data.status
        };

    }

    public static async getPackageMaintenanceListByPackage(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PackageMaintenanceDataMap > {
    
        const
            packageMaintenanceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.PACKAGE_MAINTENANCE_COLLECTION )
            ,
            packageReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.PACKAGE_COLLECTION
            ),
            packageMaintenanceQuery = query(
                packageMaintenanceCollection,
                where( "package", "==", packageReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( packageMaintenanceQuery ) ).docs
            ,
            packageMaintenanceDataMap: PackageMaintenanceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            packageMaintenanceDataMap[ snapshot.id ] =
                await PackageMaintenanceUtils.getPackageMaintenanceData( snapshot )
            ;
        return packageMaintenanceDataMap;

    }

    public static async updatePackageMaintenance(
        by: documentId | DocumentReference | DocumentSnapshot,
        packageMaintenanceData: PackageMaintenanceData
    ): Promise< boolean > {

        await PackageMaintenanceUtils.checkPackageMaintenanceData( packageMaintenanceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PACKAGE_MAINTENANCE_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, packageMaintenanceData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
