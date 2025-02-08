import { NumberRange } from "../utils/NumberRange";

export default class SpaRadiseEnv {

    public static MIN_AGE_LIMIT = 12;
    public static MIN_DENOMINATION = 30;
    public static ROOM_TYPE_LIST = [ "chair", "room" ];
    public static SERVICE_DURATION_MIN_RANGE = new NumberRange( 30, 120, 30 );
    public static SERVICE_TYPE_LIST = [
        "body", "browsAndLashes", "facial", "handsAndFoot", "health", "wax"
    ]

    public static isRoomType( string: string ): boolean {

        return SpaRadiseEnv.ROOM_TYPE_LIST.includes( string );

    }

    public static isServiceType( string: string ): boolean {

        return SpaRadiseEnv.SERVICE_TYPE_LIST.includes( string );

    }

}
