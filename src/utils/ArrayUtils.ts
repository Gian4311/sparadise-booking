export default class ArrayUtils {

    public static createEmptyArray( length: number ): undefined[] {

        return ArrayUtils.createMonoArray( length, undefined );

    }

    public static createMonoArray< T >( length: number, value: T ): T[] {

        const array: T[] = [];
        for( let index: number = 0; index < length; index++ )
            array.push( value );
        return array;

    }

    public static union< T >( ...arrayList: T[][] ): T[] {

        const arrayUnion: T[] = [];
        for( let array of arrayList ) arrayUnion.push( ...array );
        return arrayUnion;

    }

}
