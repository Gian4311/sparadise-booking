type nameFormat = "f mi l";

interface PersonData {

    lastName: string,
    firstName: string,
    middleName: string | null

}

export default class PersonUtils {

    public static format(
        personData: PersonData,
        format: nameFormat
    ): string {

        const { lastName, firstName, middleName } = personData;
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
