import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import api from '../../services/api';

const Event = () => {
  const { currentUser } = useAuth();
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
    event: 'Événement',
    allDay: 'Toute la journée',
    showMore: total => `+${total} de plus`,
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await api.get('/events/');
        const parsed = data.map(e => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setEvents(parsed);
      } catch (err) {
        console.error('Erreur lors de la récupération des évènements:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

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
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const endDateTime = moment(`${formData.end} ${formData.endTime}`, 'YYYY-MM-DD HH:mm').toDate();
      const eventData = {
        title: formData.title,
        description: formData.description,
        start: selectedDate.toISOString(),
        end: endDateTime.toISOString(),
      };
      const { data } = await api.post('/events/', eventData);
      setEvents(prev => [...prev, { ...data, start: new Date(data.start), end: new Date(data.end) }]);
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleDeleteEvent = async (event) => {
    try {
      await api.delete(`/events/${event.id}/`);
      setEvents(prev => prev.filter(e => e.id !== event.id));
      handleCloseModal();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
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
          eventPropGetter={(event) => {
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
              disabled={selectedEvent && selectedEvent.user_id !== currentUser?.id}
            >
              {selectedEvent ? 'Modifier l\'évènement' : 'Créer l\'évènement'}
            </Button>
            {selectedEvent && (
              <Button
                variant="danger"
                onClick={() => handleDeleteEvent(selectedEvent)}
                style={{ marginLeft: '10px' }}
                disabled={selectedEvent.user_id !== currentUser?.id}
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
