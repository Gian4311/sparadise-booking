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
    EmployeeData,
    EmployeeDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";
import StringUtils from "../utils/StringUtils";

export default class EmployeeUtils {

    public static async checkEmployeeData( employeeData: EmployeeData ): Promise< boolean > {
    
        const
            {
                lastName, firstName, middleName, sex, email, contactNumber, contactNumberAlternate, buildingNumber, street, barangay, city, provincee, region, zipCode, jobStatus, hireDate, unemploymentDate, unemploymentReason
            } = employeeData
        ;

        try {

            // name must be between 1-255 someth
            if( lastName === null ) throw new Error( "Last name is empty." );
            if( middleName === null ) throw new Error( "Middle name is empty." );
            if( firstName === null ) throw new Error( "First name is empty." );
            //if( !StringUtils.isTinyText( name ) ) throw new Error( "Name must be tinytext." );
            //if( description === null ) throw new Error( "Description is empty." );
            //if( !StringUtils.isTinyText( description ) ) throw new Error( "Description must be text" );
            //if( !SpaRadiseEnv.isServiceType( employeeData.serviceType ) ) throw new Error( "Invalid service type." );
            //if( !SpaRadiseEnv.isRoomType( employeeData.roomType ) ) throw new Error( "Invalid room type." );
            //if( !NumberUtils.isNaturalNumber( employeeData.ageLimit ) ) throw new Error( "Age limit must be a natural number." );
            //if( employeeData.ageLimit < MIN_AGE_LIMIT ) throw new Error( `Age limit must be ${ MIN_AGE_LIMIT }+` );
            // if( !NumberUtils.isNaturalNumber( employeeData.durationMin ) ) throw "Duration (min) must be a natural number.";

            // if( !NumberUtils.isDivisible( employeeData.durationMin, MIN_DENOMINATION ) ) throw "Duration (min) must be in increments of 30."
            // if( employeeData.durationMin === 0 ) 
            // note: check if in range

        } catch( error ) {

            throw error;

        }
        return true;
        // return (
        //     StringUtils.isTinyText( employeeData.name )
        //     && StringUtils.isText( employeeData.description )
        //     && SpaRadiseFirestore.SERVICE_TYPE_LIST.includes( employeeData.serviceType )
        //     && SpaRadiseFirestore.ROOM_TYPE_LIST.includes( employeeData.roomType )
        //     && NumberUtils.isNaturalNumber( employeeData.ageLimit )
        //     && employeeData.ageLimit >= SpaRadiseEnv.MINIMUM_AGE_LIMIT
        //     && NumberUtils.isNaturalNumber( employeeData.durationMin )
        //     && employeeData.durationMin % SpaRadiseEnv.MIN_DENOMINATION == 0

        // );

    }

    public static async createEmployee( employeeData: EmployeeData ): Promise< DocumentReference > {
    
        await EmployeeUtils.checkEmployeeData( employeeData );
        const
            employeeCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.EMPLOYEE_COLLECTION
            ),
            documentReference = await addDoc( employeeCollection, employeeData )
        ;
        return documentReference;

    }

    public static async deleteEmployee(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getEmployeeData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< EmployeeData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            lastName: data.lastName,
            firstName: data.firstName,
            middleName: data.middleName,
            sex: data.sex,
            birthDate: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "birthDate" ),
            email: data.email,
            contactNumber: data.contactNumber,
            contactNumberAlternate: data.contactNumberAlternate,
            buildingNumber: data.buildingNumber,
            street: data.street,
            barangay: data.barangay,
            city: data.city,
            province: data.province,
            region: data.region,
            zipCode: data.zipCode,
            job: data.job,
            jobStatus: data.jobStatus,
            hireDate: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "hireDate" ),
            unemploymentDate: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "unemploymentDate" ),
            unemploymentReason: data.unemploymentReason
        };

    }

    public static async getEmployeeDataMapAll(): Promise< EmployeeDataMap > {
    
        const
        employeeCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.EMPLOYEE_COLLECTION
            ),
            employeeQuery = query(
                employeeCollection,
                orderBy( "lastName" ),
                orderBy( "firstName" ),
                orderBy( "middleName" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( employeeQuery ) ).docs,
            employeeDataMap: EmployeeDataMap = {}
        ;
        for( let snapshot of snapshotList )
            employeeDataMap[ snapshot.id ] = await EmployeeUtils.getEmployeeData( snapshot );
        return employeeDataMap;

    }

    public static async updateEmployee(
        by: documentId | DocumentReference | DocumentSnapshot,
        employeeData: EmployeeData
    ): Promise< boolean > {

        await EmployeeUtils.checkEmployeeData( employeeData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.EMPLOYEE_COLLECTION
        );
        try {

            await updateDoc( documentReference, employeeData as WithFieldValue< DocumentData > );
            return true;

        } catch( error ) {

            throw error;
        }
    }
}
