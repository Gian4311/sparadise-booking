import {
    addDoc,
    CollectionReference,
    collection,
    Firestore,
    getDocs,
    getFirestore,
    QueryDocumentSnapshot
} from "firebase/firestore/lite";
import { Service, ServiceData } from "./SpaRadiseTypes";
import SpaRadiseApp from "./SpaRadiseApp";
import SpaRadiseCollections from "./SpaRadiseCollections";

export default class SpaRadiseFirestore {

    private static firestore: Firestore = getFirestore( SpaRadiseApp );

    // add use cases
    public static async addService( serviceData: ServiceData ): Promise< Service > {

        const
            serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseCollections.SERVICE_COLLECTION
            ),
            documentReference = await addDoc( serviceCollection, serviceData )
        ;
        return {
            id: documentReference.id,
            ...serviceData
        };

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

    public static async getServiceListAll(): Promise< Service[] > {

        const
            serviceCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseCollections.SERVICE_COLLECTION
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( serviceCollection ) ).docs,
            serviceList: Service[] = []
        ;
        for( let snapshot of snapshotList ) {

            if( !snapshot.exists() ) throw new Error( "Error in getting snapshot list!" );
            const data = snapshot.data();
            serviceList.push( {
                id: snapshot.id,
                name: data.name,
                description: data.description,
                serviceType: data.serviceType,
                roomType: data.roomType,
                ageLimit: data.ageLimit,
                durationMin: data.durationMin
            } );

        }
        return serviceList;

    }

}
