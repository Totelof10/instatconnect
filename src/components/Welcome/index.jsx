import React, { useState, Fragment, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {FirebaseContext} from '../FireBase'
import LogOut from '../LogOut';
import Application from '../Application';
import { onAuthStateChanged } from 'firebase/auth';

const Welcome = () => {
    const navigateTo = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const firebaseAuth = useContext(FirebaseContext);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            if (user) {
                setUserSession(user);
            } else {
                navigateTo('/');
            }
        });

        return () => unsubscribe();
    }, [firebaseAuth, navigateTo]);

    return userSession === null ? (
        <Fragment>
            <div className='loader-container'>
                <div className='loader'></div>
            </div>
        </Fragment>
    ) : (
        <div>
            <LogOut />
            <Application />
        </div>
    );
};

export default Welcome;
