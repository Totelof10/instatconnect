import React, { Fragment } from 'react';
import { Route, Routes, useNavigate} from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LogOut from '../LogOut';
import Accueil from '../../components2/Accueil'
import Actualites from '../../components2/Actualites'
import Discussions from '../../components2/Discussions'
import Setting from '../Setting/index'
import Liste from '../../components2/Liste';
import Document from '../../components2/Documents';
import DiscuGroupe from '../../components2/Groupe';
import DocumentPublic from '../../components2/DocumentsPublic';
import Event from '../../components2/Evenements';

const Welcome = () => {
    const { currentUser, loading } = useAuth();
    const navigateTo = useNavigate();

    if (loading) {
        return (
            <Fragment>
                <div className='loader-container'>
                    <div className='loader'></div>
                </div>
            </Fragment>
        );
    }

    if (!currentUser) {
        navigateTo('/');
        return null;
    }

    return (
        <div className='welcome-container'>
                <LogOut userData={currentUser}/>
                <div className='fonction-container'>
                    <Routes>
                        <Route path="accueil" element={<Accueil userData={currentUser}/>}/>
                        <Route path="actualites" element={<Actualites userData={currentUser}/>} />
                        <Route path="discussions" element={<Discussions />} />
                        <Route path='listedesutilisateurs' element={<Liste />}/>
                        <Route path='document' element={<Document />}/>
                        <Route path='discugroupe' element={<DiscuGroupe userData={currentUser}/>}/>
                        <Route path='docpublic' element={<DocumentPublic userData={currentUser}/>}/>
                        <Route path='event' element={<Event/>}/>
                        <Route path='param' element={<Setting />}/>
                    </Routes>
                </div>
                
        </div>
    );
};

export default Welcome;
