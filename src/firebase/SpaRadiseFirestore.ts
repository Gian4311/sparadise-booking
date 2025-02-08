import {
    addDoc,
    CollectionReference,
    collection,
    DocumentReference,
    DocumentSnapshot,
    doc,
    Firestore,
    getDoc,
    getDocs,
    getFirestore,
    QueryDocumentSnapshot,
} from "firebase/firestore/lite";
import NumberUtils from "../utils/NumberUtils";
import {
    ServiceData,
    ServiceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseApp from "./SpaRadiseApp";
import SpaRadiseCollections from "./SpaRadiseCollections";
import SpaRadiseEnv from "./SpaRadiseEnv";
import StringUtils from "../utils/StringUtils";

export default class SpaRadiseFirestore {

    private static ROOM_TYPE_LIST: roomType[] = [ "chair", "room" ];

    private static SERVICE_TYPE_LIST: serviceType[] = [
        "body", "browsAndLashes", "facial", "handsAndFoot", "health", "wax"
    ];

    private static firestore: Firestore = getFirestore( SpaRadiseApp );

    public static async addService( serviceData: ServiceData ): Promise< string > {

        await this.checkServiceData( serviceData );
        const
            serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseCollections.SERVICE_COLLECTION
            ),
            documentReference = await addDoc( serviceCollection, serviceData )
        ;
        return documentReference.id;

    }

    public static async checkServiceData( serviceData: ServiceData ): Promise< boolean > {

        const
            {
                MIN_AGE_LIMIT,
                MIN_DENOMINATION,
                SERVICE_DURATION_MIN_RANGE
            } = SpaRadiseEnv,
            {
                name, description, serviceType, roomType, ageLimit, durationMin
            } = serviceData
        ;

        try {

            if( name === null ) throw "Name is empty.";
            if( !StringUtils.isTinyText( name ) ) throw "Name must be tinytext.";
            if( description === null ) throw "Description is empty.";
            if( !StringUtils.isTinyText( description ) ) throw "Description must be text";
            if( !SpaRadiseEnv.isServiceType( serviceData.serviceType ) ) throw "Invalid service type.";
            if( !SpaRadiseEnv.isRoomType( serviceData.roomType ) ) throw "Invalid room type.";
            if( !NumberUtils.isNaturalNumber( serviceData.ageLimit ) ) throw "Age limit must be a natural number.";
            if( serviceData.ageLimit < MIN_AGE_LIMIT ) throw `Age limit must be ${ MIN_AGE_LIMIT }+`;
            // if( !NumberUtils.isNaturalNumber( serviceData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( serviceData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            SERVICE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( serviceData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( serviceData.name )
        //     && StringUtils.isText( serviceData.description )
        //     && SpaRadiseFirestore.SERVICE_TYPE_LIST.includes( serviceData.serviceType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( serviceData.roomType )
        //     && NumberUtils.isNaturalNumber( serviceData.ageLimit )
        //     && serviceData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( serviceData.durationMin )
        //     && serviceData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    private static getCollectionReference( collectionName: string ): CollectionReference {

        const
            firestore: Firestore = SpaRadiseFirestore.getFirestore(),
            collectionReference: CollectionReference = collection( firestore, collectionName )
        ;
        return collectionReference;

    }

    private static getFirestore(): Firestore {

        return SpaRadiseFirestore.firestore;

    }

    public static async getServiceData(
        by: string | DocumentReference | DocumentSnapshot
    ): Promise< ServiceData > {

        if( typeof by === "string" ) {

            const serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseCollections.SERVICE_COLLECTION
            );
            by = doc( serviceCollection, by );

        }
        if( by instanceof DocumentReference ) by = await getDoc( by );
        const snapshot: DocumentSnapshot = by;
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            name: data.name,
            description: data.description,
            serviceType: data.serviceType,
            roomType: data.roomType,
            ageLimit: data.ageLimit,
            durationMin: data.durationMin
        };

    }

    public static async getServiceListAll(): Promise< ServiceDataMap > {

        const
            serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseCollections.SERVICE_COLLECTION
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( serviceCollection ) ).docs,
            serviceDataMap: ServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            serviceDataMap[ snapshot.id ] = await SpaRadiseFirestore.getServiceData( snapshot );
        return serviceDataMap;

    }

}
