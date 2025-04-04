import {
    addDoc,
    and,
    CollectionReference,
    deleteDoc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    getDocs,
    orderBy,
    query,
    updateDoc,
    QueryDocumentSnapshot,
    WithFieldValue,
    where
} from "firebase/firestore/lite";
import DateRange from "../utils/DateRange"
import DateUtils from "../utils/DateUtils";
import {
    EmployeeLeaveData,
    EmployeeLeaveDataMap
} from "./SpaRadiseTypes";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import SpaRadiseEnv from "./SpaRadiseEnv";

export default class EmployeeLeaveUtils {

    public static async checkEmployeeLeaveData(
        employeeLeaveData: EmployeeLeaveData
    ): Promise< boolean > {
    
        const
            {
                MIN_AGE_LIMIT
            } = SpaRadiseEnv,
            {
                date, price, commissionPercentage, status
            } = employeeLeaveData
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

    public static async createEmployeeLeave(
        employeeLeaveData: EmployeeLeaveData
    ): Promise< DocumentReference > {
    
        await EmployeeLeaveUtils.checkEmployeeLeaveData( employeeLeaveData );
        const
            employeeLeaveCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION )
            ,
            documentReference = await addDoc(
                employeeLeaveCollection, employeeLeaveData
            )
        ;
        return documentReference;

    }

    public static async deleteEmployeeLeave(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< boolean > {

        // note: check for dependent entities
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION
        );
        try {

            await deleteDoc( documentReference );
            return true;

        } catch( error ) {

            throw error;

        }


    }

    public static async getApprovedEmployeeLeaveDataMapByDay(
        date: Date
    ): Promise< EmployeeLeaveDataMap > {

        const
            employeeLeaveCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION )
            ,
            dateTimeStart: Date = DateUtils.toFloorByDay( date ),
            dateTimeEnd: Date = DateUtils.toCeilByDay( date ),
            employeeLeaveQuery = query(
                employeeLeaveCollection,
                and(
                    where( "toDateTime", ">", dateTimeStart ),
                    where( "fromDateTime", "<", dateTimeEnd ),
                    where( "status", "==", "approved" )
                )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( employeeLeaveQuery ) ).docs
            ,
            employeeLeaveDataMap: EmployeeLeaveDataMap = {}
        ;
        for( let snapshot of snapshotList )
            employeeLeaveDataMap[ snapshot.id ] =
                await EmployeeLeaveUtils.getEmployeeLeaveData( snapshot )
            ;
        return employeeLeaveDataMap;

    }

    public static async getApprovedEmployeeLeaveDataMapByEmployee(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< EmployeeLeaveDataMap > {
    
        const
            employeeLeaveCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION )
            ,
            employeeReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.EMPLOYEE_COLLECTION
            ),
            employeeLeaveQuery = query(
                employeeLeaveCollection,
                where( "employee", "==", employeeReference ),
                where( "status", "==", "approved" )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( employeeLeaveQuery ) ).docs
            ,
            employeeLeaveDataMap: EmployeeLeaveDataMap = {}
        ;
        for( let snapshot of snapshotList )
            employeeLeaveDataMap[ snapshot.id ] =
                await EmployeeLeaveUtils.getEmployeeLeaveData( snapshot )
            ;
        return employeeLeaveDataMap;

    }

    public static async getEmployeeLeaveData(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< EmployeeLeaveData > {

        const snapshot: DocumentSnapshot = await SpaRadiseFirestore.getDocumentSnapshot(
            by, SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION
        );
        if( !snapshot.exists() ) throw new Error( "Error in getting snapshot!" );
        const data = snapshot.data();
        return {
            employee: data.employee,
            fromDateTime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "fromDateTime" ),
            toDateTime: SpaRadiseFirestore.getDateFromSnapshot( snapshot, "toDateTime" ),
            status: data.status,
            reason: data.reason
        };

    }

    public static async getEmployeeLeaveDataMapAll(): Promise< EmployeeLeaveDataMap > {
        
        const
            employeeLeaveCollection: CollectionReference = SpaRadiseFirestore.getCollectionReference(
                SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION
            ),
            employeeLeaveQuery = query(
                employeeLeaveCollection,
                orderBy( "fromDateTime", "desc" ),
                orderBy( "toDateTime", "desc" )
            ),
            snapshotList: QueryDocumentSnapshot[] = ( await getDocs( employeeLeaveQuery ) ).docs,
            employeeLeaveDataMap: EmployeeLeaveDataMap = {}
        ;
        for( let snapshot of snapshotList )
            employeeLeaveDataMap[ snapshot.id ] = await EmployeeLeaveUtils.getEmployeeLeaveData( snapshot );
        return employeeLeaveDataMap;

    }

    public static async getEmployeeLeaveDataMapByEmployee(
        by: documentId | DocumentReference | DocumentSnapshot
    ): Promise< EmployeeLeaveDataMap > {
    
        const
            employeeLeaveCollection: CollectionReference =
                SpaRadiseFirestore.getCollectionReference( SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION )
            ,
            employeeReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
                by, SpaRadiseEnv.EMPLOYEE_COLLECTION
            ),
            employeeLeaveQuery = query(
                employeeLeaveCollection,
                where( "employee", "==", employeeReference )
            ),
            snapshotList: QueryDocumentSnapshot[] =
                ( await getDocs( employeeLeaveQuery ) ).docs
            ,
            employeeLeaveDataMap: EmployeeLeaveDataMap = {}
        ;
        for( let snapshot of snapshotList )
            employeeLeaveDataMap[ snapshot.id ] =
                await EmployeeLeaveUtils.getEmployeeLeaveData( snapshot )
            ;
        return employeeLeaveDataMap;

    }

    public static async updateEmployeeLeave(
        by: documentId | DocumentReference | DocumentSnapshot,
        employeeLeaveData: EmployeeLeaveData
    ): Promise< boolean > {

        await EmployeeLeaveUtils.checkEmployeeLeaveData( employeeLeaveData );
        const documentReference: DocumentReference = SpaRadiseFirestore.getDocumentReference(
            by, SpaRadiseEnv.EMPLOYEE_LEAVE_COLLECTION
        );
        try {

            await updateDoc(
                documentReference, employeeLeaveData as WithFieldValue< DocumentData >
            );
            return true;

        } catch( error ) {

            throw error;

        }

    }

}
