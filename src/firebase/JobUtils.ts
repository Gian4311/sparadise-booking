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
    JobData,
    JobDataMap
} from "./SpaRadiseTypes";
import SpaRadiseEnv from "./SpaRadiseEnv";
import SpaRadiseFirestore from "./SpaRadiseFirestore";

export default class JobUtils {

    public static async checkJobData( jobData: JobData ): Promise< boolean > {
    
        const
            {
                name, description, jobType, roomType, ageLimit, durationMin
            } = jobData
        ;

        try {

            // name must be between 1-255 someth
            // if( name === null ) throw new Error( "Name is empty." );
            // if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            // if( description === null ) throw new Error( "Description is empty." );
            // if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            // if( !SpaRadiseEnv.isJobType( jobData.jobType ) ) throw new Error( "Invalid job type." );
            // if( !SpaRadiseEnv.isRoomType( jobData.roomType ) ) throw new Error( "Invalid room type." );
            // if( !NumberUtils.isNaturalNumber( jobData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            // if( jobData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( jobData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( jobData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // JOB_DURATION_MIN_RANGE.checkInRange( durationMin, "Duration (min)" )
            // if( jobData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( jobData.name )
        //     && StringUtils.isText( jobData.description )
        //     && SpaRadiseFirestore.JOB_TYPE_LIST.includes( jobData.jobType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( jobData.roomType )
        //     && NumberUtils.isNaturalNumber( jobData.ageLimit )
        //     && jobData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( jobData.durationMin )
        //     && jobData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createJob( jobData: JobData ): Promise< DocumentReference > {
    
        await JobUtils.checkJobData( jobData );
        const
            jobCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.JOB_COLLECTION
            ),
            documentReference = await addDoc( jobCollection, jobData )
        ;
        return documentReference;

    }

    public static async deleteJob(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.JOB_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getJobData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< JobData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.JOB_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            name: data.name,
            description: data.description
        };

    }

    public static async getJobDataMapAll(): Promise< JobDataMap > {
    
        const
            jobCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.JOB_COLLECTION
            ),
            jobQuery = query(
                jobCollection,
                orderBy( "name" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( jobQuery ) ).docs,
            jobDataMap: JobDataMap = {}
        ;
        for( let snapshot of snapshotList )
            jobDataMap[ snapshot.id ] = await JobUtils.getJobData( snapshot );
        return jobDataMap;

    }

    public static async updateJob(
        by: documentId | DocumentReference | DocumentSnapshot,
        jobData: JobData
    ): Promise< boolean > {

        await JobUtils.checkJobData( jobData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.JOB_COLLECTION
        );
        try {

            await updateDoc( documentReference, jobData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
