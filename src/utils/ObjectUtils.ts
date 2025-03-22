interface ObjectParam< V > {

    [ keyName: objectKeyName ]: V

}

export default class ObjectUtils {

    public static filter< V >(
        object: ObjectParam< V >,
        validate: ( keyName: string, value: V, object: ObjectParam< V > ) => boolean
    ): ObjectParam< V > {

        const newObject: ObjectParam< V > = {};
        for( let keyName in object )
            if( validate( keyName, object[ keyName ], object ) )
                newObject[ keyName ] = object[ keyName ];
        return newObject;

    }

    public static hasKeys( object: Object ): boolean {

        return Object.keys( object ).length > 0;

    }

    public static keyLength( object: Object ): number {

        return Object.keys( object ).length;

    }

}
