import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
    const [guestCount, setGuestCount] = useState(2);
    const [guestDetails, setGuestDetails] = useState({ name: '', phone: '', email: '' });
    const [reservationId, setReservationId] = useState(null);
    const navigate = useNavigate()
    const [restDetails, setRestDetails] = useState(null); // Restaurant details

    const { slug } = useParams(); // Capture :slug from the URL

    useEffect(() => {

        const fetchRestaurant = async () => {
            if (!slug) return;

            // Fetch restaurant by slug
            const { data, error } = await supabase
                .from('restaurant')          // your table name
                .select('*')                 // or select only columns you need
                .eq('slug', slug)            // match the slug column
                .single();                   // expect one restaurant

            if (error) {
                console.error('Error fetching restaurant:', error);
                navigate('/vendor')
            } else {
                setRestDetails(data);
                localStorage.setItem('rest_details', JSON.stringify(data)); // optional: persist
            }
        };

        fetchRestaurant();


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
                restDetails
            }}
        >
            {children}
        </GuestContext.Provider>
    );
};

export const useGuest = () => useContext(GuestContext);
