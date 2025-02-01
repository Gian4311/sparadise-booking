export default class NumberUtils {

    public static isInteger( number: number ): boolean {

        return ( number % 2 ) == 0;

    }

    public static isNaturalNumber( number: number ): boolean {

        return NumberUtils.isInteger( number ) && number >= 0;

    }

}
