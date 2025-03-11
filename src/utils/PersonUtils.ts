type nameFormat = "f mi l";

export default class PersonUtils {

    public static format(
        firstName: string,
        middleName: string | null,
        lastName: string,
        format: nameFormat
    ): string {

        let middleInitial: string | null;
        switch( format ) {

            case "f mi l":
                middleInitial = PersonUtils.getMiddleInitial( middleName );
                return `${ firstName } ` + ( middleInitial ? `${ middleInitial }. `: `` ) + lastName;

        }

    }

    public static getMiddleInitial( middleName: string | null ): string | null {

        return middleName ? middleName[ 0 ] : null;

    }

}
