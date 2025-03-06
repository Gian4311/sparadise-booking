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
    PackageData,
    PackageDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class PackageUtils {

    public static async checkPackageData( packageData: PackageData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = packageData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isPackageType( packageData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( packageData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( packageData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( packageData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( packageData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( packageData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( packageData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( packageData.name )
        //     && StringUtils.isText( packageData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( packageData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( packageData.roomType )
        //     && NumberUtils.isNaturalNumber( packageData.ageLimit )
        //     && packageData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( packageData.durationMin )
        //     && packageData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createPackage( packageData: PackageData ): Promise< DocumentReference > {
    
        await PackageUtils.checkPackageData( packageData );
        const
            packageCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.PACKAGE_COLLECTION
            ),
            documentReference = await addDoc( packageCollection, packageData )
        ;
        return documentReference;

    }

    public static async deletePackage(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PACKAGE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getPackageData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< PackageData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.PACKAGE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            name: data.name,
            description: data.description
        };

    }

    public static async getPackageListAll(): Promise< PackageDataMap > {
    
        const
            packageCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.PACKAGE_COLLECTION
            ),
            packageQuery = query(
                packageCollection,
                orderBy( "name" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( packageQuery ) ).docs,
            packageDataMap: PackageDataMap = {}
        ;
        for( let snapshot of snapshotList )
            packageDataMap[ snapshot.id ] = await PackageUtils.getPackageData( snapshot );
        return packageDataMap;

    }

    public static async updatePackage(
        by: documentId | DocumentReference | DocumentSnapshot,
        packageData: PackageData
    ): Promise< boolean > {

        await PackageUtils.checkPackageData( packageData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.PACKAGE_COLLECTION
        );
        try {

            await updateDoc( documentReference, packageData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
