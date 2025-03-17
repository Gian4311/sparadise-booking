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
    JobServiceData,
    JobServiceDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class JobServiceUtils {

    public static async checkJobServiceData(
        jobServiceData: JobServiceData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT
            } = SpaRadiseEnv,
            {
                date, price, commissionPercentage, status
            } = jobServiceData
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

    public static async createJobService(
        jobServiceData: JobServiceData
    ): Promise< DocumentReference > {
    
        await JobServiceUtils.checkJobServiceData( jobServiceData );
        const
            jobServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.JOB_SERVICE_COLLECTION )
            ,
            documentReference = await addDoc(
                jobServiceCollection, jobServiceData
            )
        ;
        return documentReference;

    }

    public static async deleteJobService(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.JOB_SERVICE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getJobServiceData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< JobServiceData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.JOB_SERVICE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            job: data.job,
            service: data.service
        };

    }

    public static async getJobServiceDataMapByJob(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< JobServiceDataMap > {
    
        const
            jobServiceCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.JOB_SERVICE_COLLECTION )
            ,
            jobReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.JOB_COLLECTION
            ),
            jobServiceQuery = query(
                jobServiceCollection,
                where( "job", "==", jobReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( jobServiceQuery ) ).docs
            ,
            jobServiceDataMap: JobServiceDataMap = {}
        ;
        for( let snapshot of snapshotList )
            jobServiceDataMap[ snapshot.id ] =
                await JobServiceUtils.getJobServiceData( snapshot )
            ;
        return jobServiceDataMap;

    }

    public static async updateJobService(
        by: documentId | DocumentReference | DocumentSnapshot,
        jobServiceData: JobServiceData
    ): Promise< boolean > {

        await JobServiceUtils.checkJobServiceData( jobServiceData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.JOB_SERVICE_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, jobServiceData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
