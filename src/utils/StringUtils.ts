export default class StringUtils {

    public static isTinyText( string: string ): boolean {

        return string.length <= 2**8 - 1;

    }

    public static isText( string: string ): boolean {

        return string.length <= 2**16 - 1;

    }

}
