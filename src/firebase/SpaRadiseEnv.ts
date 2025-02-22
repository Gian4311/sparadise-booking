import { NumberRange } from "../utils/NumberRange";

export default class SpaRadiseEnv {

    public static MIN_AGE_LIMIT = 12;
    public static MIN_DENOMINATION = 30;
    public static ROOM_TYPE_LIST = [ "chair", "room" ];
    public static SERVICE_COLLECTION = "services";
    public static SERVICE_DURATION_MIN_RANGE = new NumberRange( 0, 120, 30, false );
    public static SERVICE_MAINTENANCE_COLLECTION = "serviceMaintenances";
    public static SERVICE_TYPE_LIST = [
        "body", "browsAndLashes", "facial", "handsAndFeet", "health", "wax"
    ];
    public static SERVICE_MAINTENANCE_STATUS_TYPE_LIST = [ "active", "inactive" ];

    public static isRoomType( string: string ): boolean {

        return SpaRadiseEnv.ROOM_TYPE_LIST.includes( string );

    }

    public static isServiceType( string: string ): boolean {

        return SpaRadiseEnv.SERVICE_TYPE_LIST.includes( string );

    }

}
