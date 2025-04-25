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
    ClientData,
    ClientDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class ClientUtils {

    public static async checkClientData( clientData: ClientData ): Promise< boolean > {
    
        const
            {
                name, description, packageType, roomType, ageLimit, durationMin
            } = clientData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isClientType( clientData.packageType ) ) throw new Error( "Invalid package type." );
            // if( !SpaRadiseEnv.isRoomType( clientData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( clientData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( clientData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( clientData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( clientData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // PACKAGE_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( clientData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( clientData.name )
        //     && StringUtils.isText( clientData.description )
        //     && SpaRadiseFirestore.PACKAGE_TYPE_LIST.includes( clientData.packageType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( clientData.roomType )
        //     && NumberUtils.isNaturalNumber( clientData.ageLimit )
        //     && clientData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( clientData.durationMin )
        //     && clientData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createClient( clientData: ClientData ): Promise< DocumentReference > {
    
        await ClientUtils.checkClientData( clientData );
        const
            clientCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.CLIENT_COLLECTION
            ),
            documentReference = await addDoc( clientCollection, clientData )
        ;
        return documentReference;

    }

    public static async deleteClient(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.CLIENT_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getClientData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ClientData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.CLIENT_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            booking: data.booking,
            name: data.name,
            birthDate: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "birthDate" ),
            notes: data.notes
        };

    }

    public static async getClientDataMapAll(): Promise< ClientDataMap > {
    
        const
            clientCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.CLIENT_COLLECTION
            ),
            clientQuery = query(
                clientCollection,
                orderBy( "name" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( clientQuery ) ).docs,
            clientDataMap: ClientDataMap = {}
        ;
        for( let snapshot of snapshotList )
            clientDataMap[ snapshot.id ] = await ClientUtils.getClientData( snapshot );
        return clientDataMap;

    }

    public static async getClientDataMapByBooking(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< ClientDataMap > {
    
        const
            clientCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.CLIENT_COLLECTION )
            ,
            bookingReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.BOOKING_COLLECTION
            ),
            clientQuery = query(
                clientCollection,
                where( "booking", "==", bookingReference )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( clientQuery ) ).docs,
            clientDataMap: ClientDataMap = {}
        ;
        for( let snapshot of snapshotList )
            clientDataMap[ snapshot.id ] =
                await ClientUtils.getClientData( snapshot )
            ;
        return clientDataMap;

    }

    public static async updateClient(
        by: documentId | DocumentReference | DocumentSnapshot,
        clientData: ClientData
    ): Promise< boolean > {

        await ClientUtils.checkClientData( clientData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.CLIENT_COLLECTION
        );
        try {

            await updateDoc( documentReference, clientData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
