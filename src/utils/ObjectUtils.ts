interface ObjectParam< V > {

    [ keyName: objectKeyName ]: V

}

export default class ObjectUtils {

    public static clear< V >( object: ObjectParam< V > ): ObjectParam< V > {

        for( let keyName in object ) delete object[ keyName ];
        return object;

    }

    public static fill< T >(
        object1: ObjectParam< T >, object2: ObjectParam< T >
    ): ObjectParam< T > {

        for( let keyName in object2 ) object1[ keyName ] = object2[ keyName ];
        return object1;

    }

    public static filter< V >(
        object: ObjectParam< V >,
        filter: ( keyName: string, value: V, object: ObjectParam< V > ) => boolean
    ): ObjectParam< V > {

        const newObject: ObjectParam< V > = {};
        for( let keyName in object )
            if( filter( keyName, object[ keyName ], object ) )
                newObject[ keyName ] = object[ keyName ];
        return newObject;

    }

    public static getFirstKeyName< V >( object: ObjectParam< V > ): string | undefined {

        for( let keyName in object ) return keyName;

    }

    public static hasKeys( object: Object ): boolean {

        return Object.keys( object ).length > 0;

    }

    public static keyLength( object: Object ): number {

        return Object.keys( object ).length;

    }

    public static toArray< V, T >(
        object: ObjectParam< V >,
        map: ( keyName: string, value: V, object: ObjectParam< V > ) => T
    ): T[] {

        const array: T[] = [];
        for( let keyName in object ) {

            const
                value: V = object[ keyName ],
                add: T = map( keyName, value, object )
            ;
            array.push( add );

        }
        return array;

    }

}
