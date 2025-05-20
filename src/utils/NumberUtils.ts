export default class NumberUtils {

    public static isDivisible( dividend: number, divisor: number ): boolean {

        return dividend % divisor === 0;

    }

    public static isEven( number: number ): boolean {

        return number % 2 === 0;

    }

    public static isInteger( number: number ): boolean {

        return ( number % 1 ) == 0;

    }

    public static isNaturalNumber( number: number ): boolean {

        return NumberUtils.isInteger( number ) && number >= 0;

    }

    public static isNumeric( value: unknown ): boolean {

        return !isNaN( +( value as number ) );

    }

    public static isOdd( number: number ): boolean {

        return number % 2 === 1;

    }

    public static round( number: number, decimalPlaces: number ): number {

        return Math.round( number * 10**decimalPlaces ) / 10**decimalPlaces;

    }

    public static toString( number: number, format: numberFormat ): string {

        switch( format ) {

            case "n.00":
                const [ int, decimal = "" ] = NumberUtils.round( number, 2 ).toString().split( "." );
                return `${ int }.${ decimal.padEnd( 2, "0" ) }`;

        }

    }

}
