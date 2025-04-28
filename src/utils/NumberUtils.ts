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

}
