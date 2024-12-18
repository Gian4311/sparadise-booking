import { Firestore } from "firebase/firestore/lite";
import { getFirestore } from "firebase/firestore/lite";
import SpaRadiseApp from "./SpaRadiseApp";

export default class SpaRadiseFirestore {

    private static firestore: Firestore = getFirestore( SpaRadiseApp );

    public static getFirestore(): Firestore {

        return SpaRadiseFirestore.firestore;

    }

}
