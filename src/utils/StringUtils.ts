export default class StringUtils {

    public static arrayIntersection(
        array1: string[], array2: string[]
    ): string[] {

        const
            stringCountMap: { [ string: string ]: number } = {},
            array: string[] = []
        ;
        for( let string of array2 ) {

            if( string in array1 )
                stringCountMap[ string ]++;
            else
                stringCountMap[ string ] = 0;

        };
        for( let string of array1 )
            if( stringCountMap[ string ] ) {

                array.push( string );
                stringCountMap[ string ]--;

            }
        return array;

    }

    public static compare( string1: string, string2: string, ascending: boolean = true ): number {

        const sign: number = ascending ? 1 : -1;
        return sign * ( ( string1 > string2 ) ? 1 : -1 );

    }

    public static has(
        string: string,
        substring: string,
        caseInsensitive: boolean = true,
        trim: boolean = true
    ): boolean {

        if( caseInsensitive ) {

            string = string.toLowerCase();
            substring = substring.toLowerCase();

        }
        if( trim ) substring = substring.trim();
        if( !substring ) return true;
        return string.includes( substring );

    }

    public static isTinyText( string: string ): boolean {

        return string.length <= 2**8 - 1;

    }

    public static isText( string: string ): boolean {

        return string.length <= 2**16 - 1;

    }

}
