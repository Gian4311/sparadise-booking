import {
    CollectionReference,
    collection,
    DocumentReference,
    DocumentSnapshot,
    doc,
    Firestore,
    getDoc,
    getFirestore
} from "firebase/firestore/lite";
import SpaRadiseApp from "./SpaRadiseApp";

export default class SpaRadiseFirestore {

    private static firestore: Firestore = getFirestore( SpaRadiseApp );

    public static getCollectionReference( collectionName: string ): CollectionReference {

        const
            firestore: Firestore = SpaRadiseFirestore.getFirestore(),
            collectionReference: CollectionReference = collection( firestore, collectionName )
        ;
        return collectionReference;

    }

    public static getDateFromSnapshot( snapshot: DocumentSnapshot, key: string ): Date {

        const data = snapshot.get( key );
        return data ? new Date( data.seconds * 1000 ) : ( null as unknown as Date );

    }

    public static getDocumentId( by: documentId | DocumentReference | DocumentSnapshot ): string {

        if( by instanceof DocumentReference || by instanceof DocumentSnapshot ) by = by.id;
        return by;

    }

    public static getDocumentReference(
        by: documentId | DocumentReference | DocumentSnapshot, collectonName?: string
    ): DocumentReference {

        if( typeof by === "string" ) {

            if( !collectonName ) throw `Collection name must be given.`;
            return doc( SpaRadiseFirestore.getFirestore(), collectonName, by );

        } else if( by instanceof DocumentSnapshot )
            return by.ref;
        else
            return by;

    }

    public static async getDocumentSnapshot(
        by: documentId | DocumentReference | DocumentSnapshot, collectonName?: string
    ): Promise< DocumentSnapshot > {

        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, collectonName
        );
        return getDoc( documentReference );

    }

    public static getFirestore(): Firestore {

        return SpaRadiseFirestore.firestore;

    }

}
