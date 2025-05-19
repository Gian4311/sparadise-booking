import {
    AccountData,
    AccountDataMap
} from "./SpaRadiseTypes";
import AccountUtils from "./AccountUtils";
import {
    documentId,
    where
} from "firebase/firestore/lite";
import SpaRadiseApp from "./SpaRadiseApp";
import SpaRadiseFirestore from "./SpaRadiseFirestore";
import {
    Auth,
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    signOut
} from "firebase/auth";

export default class SpaRadiseAuth {

    private static auth: Auth = getAuth( SpaRadiseApp );

    public static getAuth(): Auth {

        return SpaRadiseAuth.auth;

    }

    public static getEmail(): string | null {

        const user = SpaRadiseAuth.getAuth().currentUser;
        return user?.email ?? null;

    }

    public static getUid(): string | null {

        const user = SpaRadiseAuth.getAuth().currentUser;
        return user?.uid ?? null;

    }

    public static async isManager(): Promise< boolean > {

        const uid = SpaRadiseAuth.getUid();
        if( !uid ) return false;
        try {

            const email = SpaRadiseAuth.getEmail();
            if( !email ) throw null;
            const accountDataMap: AccountDataMap =
                await AccountUtils.getAccountDataByEmail( email )
            ;
            let accountData: AccountData | undefined = undefined;
            for( let accountId in accountDataMap )
                accountData = accountDataMap[ accountId ];
            return accountData?.accountType === "management";

        } catch( error ) {

            return false;

        }

    }

    public static isSignedIn(): boolean {

        return Boolean( SpaRadiseAuth.getAuth().currentUser );

    }

    public static async signInGoogle(): Promise< void > {

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await signInWithPopup( SpaRadiseAuth.getAuth(), provider );
    
    }

    public static async signOutGoogle(): Promise< void > {

        await signOut( SpaRadiseAuth.getAuth() );
    
    }

}
