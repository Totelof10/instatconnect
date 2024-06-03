import React, { useState, useEffect, useContext } from 'react';
import { FirebaseContext } from '../../components/FireBase/firebase';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { getFirestore, collection, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const Event = () => {
  const firebaseAuth = useContext(FirebaseContext);
  const userId = firebaseAuth.currentUser.uid;
  const localizer = momentLocalizer(moment);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    startTime: '',
    endTime: ''
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const messages = {
    today: 'Aujourd\'hui',
    previous: 'Précédent',
    next: 'Suivant',
    month: 'Mois',
    week: 'Semaine',
    day: 'Jour',
    agenda: 'Agenda',
    date: 'Date',
    time: 'Heure',
    event: 'Événement', // Nom de l'événement
    allDay: 'Toute la journée',
    showMore: total => `+${total} de plus`,
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const updatedEvents = [];
      snapshot.forEach((doc) => {
        updatedEvents.push({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          start: doc.data().start.toDate(),
          end: doc.data().end.toDate(),
          userId: doc.data().userId,
        });
      });
      setEvents(updatedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const handleOpenModal = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      start: '',
      end: '',
      startTime: '',
      endTime: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      //const startDateTime = moment(`${formData.start} ${formData.startTime}`, 'YYYY-MM-DD HH:mm').toDate();
      const endDateTime = moment(`${formData.end} ${formData.endTime}`, 'YYYY-MM-DD HH:mm').toDate();
      const eventData = {
        title: formData.title,
        description: formData.description,
        start: selectedDate,
        end: endDateTime,
        userId: firebaseAuth.currentUser.uid
      };
      await addDoc(collection(db, 'events'), eventData);
      console.log('Ajout avec succès');
      handleCloseModal();
    } catch (error) {
      console.error('Erreur: ', error);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      await deleteDoc(doc(db, 'events', event.id));
      console.log('Suppression effectuée');
    } catch (error) {
      console.error('Erreur: ', error);
    }
  };

  const isToday = (date) => {
    return moment().isSame(date, 'day');
  };

  return (
    <div style={{ height: 500, backgroundColor: 'white' }}>
      {loading ? (
        <div className='loader'></div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ margin: '50px', fontStyle: 'italic' }}
          selectable
          messages={messages}
          onSelectSlot={handleOpenModal}
          onSelectEvent={(event) => {
            setSelectedEvent(event);
            setFormData({
              title: event.title,
              description: event.description,
              start: moment(event.start).format('YYYY-MM-DD'),
              end: moment(event.end).format('YYYY-MM-DD'),
              startTime: moment(event.start).format('HH:mm'),
              endTime: moment(event.end).format('HH:mm')
            });
            setShowModal(true);
          }}
          eventPropGetter={(event, start, end, isSelected) => {
            let backgroundColor = '#3174ad';
            if (event.type === 'important') {
              backgroundColor = '#d9534f';
            }
            return { style: { backgroundColor } };
          }}
          dayPropGetter={(date) => {
            let backgroundColor = '#ffffff';
            if (isToday(date)) {
              backgroundColor = '#ffeb3b';
            } else if (events.some(event => moment(date).isSame(event.start, 'day'))) {
              backgroundColor = '#f0f0f0';
            }
            return { style: { backgroundColor } };
          }}
        />
      )}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? 'Modifier l\'évènement' : 'Créer un évènement'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateEvent}>
            <Form.Group controlId="eventTitle">
              <Form.Label>Titre:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Entrer titre"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="eventDescription">
              <Form.Label>Description:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Entrer description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="eventStartDate">
              <Form.Label>Date de début:</Form.Label>
              <Form.Control
                type="date"
                name="start"
                value={selectedDate ? moment(selectedDate).format('YYYY-MM-DD') : ''}
                onChange={handleInputChange}
              />
              <Form.Control
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="eventEndDate">
              <Form.Label>Date de fin:</Form.Label>
              <Form.Control
                type="date"
                name="end"
                value={formData.end}
                onChange={handleInputChange}
              />
              <Form.Control
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              disabled={selectedEvent && selectedEvent.userId !== userId}
            >
              {selectedEvent ? 'Modifier l\'évènement' : 'Créer l\'évènement'}
            </Button>
            {selectedEvent && (
              <Button
                variant="danger"
                onClick={() => handleDeleteEvent(selectedEvent)}
                style={{ marginLeft: '10px' }}
                disabled={selectedEvent.userId !== userId}
              >
                Supprimer l'évènement
              </Button>
            )}
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Event;
