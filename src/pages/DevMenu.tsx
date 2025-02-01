import { doc, getDoc } from "firebase/firestore/lite";
import { Firestore } from "firebase/firestore/lite";
import { Link } from "react-router-dom";
import SpaRadiseFirestore from "../firebase/SpaRadiseFirestore";
import { useEffect } from "react";

export default function DevMenu(): JSX.Element {

    useEffect( () => { ( async() => {

        // const firestore: Firestore = SpaRadiseFirestore.getFirestore();
        // const a = doc( firestore, "sample", "8GtJ031Dz7cfr5iR0Usa" );
        // const b = await getDoc( a );
        // console.log( b.data() );
        console.log( await SpaRadiseFirestore.getServiceListAll() )

    } )() }, [] );

    async function addNewService(): Promise< void > {

        await SpaRadiseFirestore.addService( {
            name: "data.name",
            description: "data.description",
            serviceType: "body",
            roomType: "chair",
            ageLimit: 35,
            durationMin: 45
        } );

    }

    return <>
        <Link to="dayPlanner"><button>Go to Day Planner experiment page</button></Link>
        <button onClick={ addNewService }>Add</button>
    </>;

}
