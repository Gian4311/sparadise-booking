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
import NumberUtils from "../utils/NumberUtils";
import {
    ServiceData,
    ServiceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";
import StringUtils from "../utils/StringUtils";

export default class ServiceUtils {

    public static areCompatibleServiceData(
        serviceData1: ServiceData, serviceData2: ServiceData
    ): boolean {

        const
            { serviceType: serviceType1, roomType: roomType1 } = serviceData1,
            { serviceType: serviceType2, roomType: roomType2 } = serviceData2,
            compatibleServiceTypes: boolean = (
                ( serviceType1 === "handsAndFeet" && serviceType2 === "browsAndLashes" )
                || ( serviceType1 === "browsAndLashes" && serviceType2 === "handsAndFeet" )
                || ( serviceType1 === "handsAndFeet" && serviceType2 === "facial" )
                || ( serviceType1 === "facial" && serviceType2 === "handsAndFeet" )
            ),
            compatibleRoomTypes: boolean = ( roomType1 === roomType2 )
        ;
        return ( compatibleServiceTypes && compatibleRoomTypes );

    }

    public static async checkServiceData( serviceData: ServiceData ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT,
                SERVICE_DURATION_MIN_RANGE
            } = SpaRadiseEnv,
            {
                name, description, serviceType, roomType, ageLimit, durationMin
            } = serviceData
        ;

        try {

            // name must be between 1-255 someth
            if( name === null ) throw new Error( "Name is empty." );
            if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            if( description === null ) throw new Error( "Description is empty." );
            if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            if( !SpaRadiseEnv.isServiceType( serviceData.serviceType ) ) throw new Error( "Invalid service type." );
            if( !SpaRadiseEnv.isRoomType( serviceData.roomType ) ) throw new Error( "Invalid room type." );
            if( !NumberUtils.isNaturalNumber( serviceData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            if( serviceData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
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

    public static async createService( serviceData: ServiceData ): Promise< DocumentReference > {
    
        await ServiceUtils.checkServiceData( serviceData );
        const
            serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.SERVICE_COLLECTION
            ),
            documentReference = await addDoc( serviceCollection, serviceData )
        ;
        return documentReference;

    }

    public static async deleteService(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.SERVICE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getServiceData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ServiceData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.SERVICE_COLLECTION
        );
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

    public static async getServiceDataMapAll(): Promise< ServiceDataMap > {
    
        const
            serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.SERVICE_COLLECTION
            ),
            serviceQuery = query(
                serviceCollection,
                orderBy( "name" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( serviceQuery ) ).docs,
            serviceDataMap: ServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            serviceDataMap[ snapshot.id ] = await ServiceUtils.getServiceData( snapshot );
        return serviceDataMap;

    }

    public static async updateService(
        by: documentId | DocumentReference | DocumentSnapshot,
        serviceData: ServiceData
    ): Promise< boolean > {

        await ServiceUtils.checkServiceData( serviceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.SERVICE_COLLECTION
        );
        try {

            await updateDoc( documentReference, serviceData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
