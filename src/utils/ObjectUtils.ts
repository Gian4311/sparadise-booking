export default class ObjectUtils {

    public static hasKeys( object: Object ): boolean {

        return Object.keys( object ).length > 0;

    }

    public static keyLength( object: Object ): number {

        return Object.keys( object ).length;

    }

}
