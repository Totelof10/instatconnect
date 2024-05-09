import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { getFirestore, collection, addDoc, onSnapshot } from 'firebase/firestore';

const Event = () => {
  const localizer = momentLocalizer(moment);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start:'',
    end:''
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true); // State for loading indicator
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const updatedEvents = [];
      snapshot.forEach((doc) => {
        updatedEvents.push({
          id: doc.id,
          title: doc.data().title,
          description: doc.data().description,
          start: doc.data().start.toDate(), // Convert Firestore timestamp to Date object
          end: doc.data().end.toDate(), // Convert Firestore timestamp to Date object
        });
      });
      setEvents(updatedEvents);
      setLoading(false); // Set loading to false after data is fetched
    });

    return () => unsubscribe();
  }, [db]);

  const handleOpenModal = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
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
      const eventData = {
        title: formData.title,
        description: formData.description,
        start: selectedDate,
        end: new Date(formData.end), // Utilisez la date de fin saisie manuellement
      };
      await addDoc(collection(db, 'events'), eventData);
      console.log('Event added successfully');
      setShowModal(false);
      setFormData({
        title: '',
        description: '',
        start: '',
        end: '',
      });
    } catch (error) {
      console.error('Error adding event: ', error);
    }
  };
  

  return (
    <div style={{ height: 500 }}>
      {loading ? ( // Show loading indicator while data is being fetched
        <div>Loading...</div>
      ) : (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ margin: '50px' }}
          selectable
          onSelectSlot={handleOpenModal}
          eventPropGetter={(event, start, end, isSelected) => {
            let backgroundColor = '#3174ad'; // Couleur par défaut
            if (event.type === 'important') {
              backgroundColor = '#d9534f'; // Couleur pour les événements importants
            }
            return { style: { backgroundColor } };
          }}
          dayPropGetter={(date) => {
            const hasEvents = events.some(event => moment(date).isSame(event.start, 'day'));
            let backgroundColor = '#ffffff'; // Couleur par défaut
            if (hasEvents) {
              backgroundColor = '#f0f0f0'; // Couleur pour les dates avec des événements
            }
            return { style: { backgroundColor } };
          }}
        />
      )}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Création d'évènements</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCreateEvent}>
            <Form.Group controlId="eventTitle">
              <Form.Label>Title:</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter title"
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
                placeholder="Enter description"
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
                disabled
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
            </Form.Group>

            <Button variant="primary" type="submit">
              Créer l'évènements
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Event;
