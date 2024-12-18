import React from 'react';
import logo from './logo.svg';
import './App.css';
import SpaRadiseApp from './firebase/SpaRadiseApp';
import SpaRadiseFirestore from './firebase/SpaRadiseFirestore';
import { useEffect } from 'react';
import {
    addDoc,
    collection,
    CollectionReference,
    deleteDoc,
    doc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    Firestore,
    getCount,
    getDoc,
    getDocs,
    getFirestore,
    Query,
    query,
    QueryConstraint,
    updateDoc,
    WithFieldValue
} from "firebase/firestore/lite";

function App() {

    useEffect( () => { ( async() => {

        const firestore: Firestore = SpaRadiseFirestore.getFirestore();
        const a = doc( firestore, "sample", "8GtJ031Dz7cfr5iR0Usa" );
        const b = await getDoc( a );
        console.log( b.data() )

    } )() }, [] );

    return (
        <div className="App">
        <header className="App-header">``
            <img src={logo} className="App-logo" alt="logo" />
            <p>
            Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
            >
            Learn Reactthrrttrhtrt
            </a>
        </header>
        </div>
    );
}

export default App;
