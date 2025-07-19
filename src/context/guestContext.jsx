import React, { createContext, useContext, useState, useEffect } from 'react';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
    const [guestCount, setGuestCount] = useState(2);
    const [guestDetails, setGuestDetails] = useState({ name: '', phone: '', email: '' });
    const [reservationId, setReservationId] = useState(null);

    useEffect(() => {
        // On load, pull reservationId from localStorage
        const savedId = localStorage.getItem('reservation_id');
        if (savedId) setReservationId(savedId);


        console.log(reservationId);

    }, []);

    const saveReservationId = (id) => {
        localStorage.setItem('reservation_id', id);
        setReservationId(id);
    };

    const clearReservation = () => {
        localStorage.removeItem('reservation_id');
        setReservationId(null);
        setGuestDetails({ name: '', phone: '', email: '' });
        setGuestCount(2);
    };

    return (
        <GuestContext.Provider
            value={{
                guestCount,
                setGuestCount,
                guestDetails,
                setGuestDetails,
                reservationId,
                saveReservationId,
                clearReservation,
            }}
        >
            {children}
        </GuestContext.Provider>
    );
};

export const useGuest = () => useContext(GuestContext);
