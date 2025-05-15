type nameFormat = "f mi l";
type orderByElement = "firstName" | "lastName" | "middleName";

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

    public static compare(
        personData1: PersonData, personData2: PersonData,
        orderBy: orderByElement[] = [ "lastName", "firstName", "middleName" ],
        ascending: boolean = true
    ): number {

        const sign: number = ascending ? 1 : -1;

        function getNameByOrderByElement(
            personData: PersonData, orderByElement: orderByElement
        ): string {

            switch( orderByElement ) {

                case "lastName": return personData.lastName;
                case "firstName": return personData.firstName;

                case "middleName":
                    const { middleName } = personData;
                    return middleName ?? "";
                

            }

        } 

        for( let orderByElement of orderBy ) {

            const
                name1: string = getNameByOrderByElement( personData1, orderByElement ),
                name2: string = getNameByOrderByElement( personData2, orderByElement ),
                isEqual: boolean = ( name1 === name2 )
            ;
            if( isEqual ) continue;
            return sign * ( ( name1 > name2 ) ? 1 : -1 );

        }
        return -1;

    }

    public static getMiddleInitial( middleName: string | null ): string | null {

        return middleName ? middleName[ 0 ] : null;

    }

}
