import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/guestContext'; // adjust path as needed
import { supabase } from '../supabaseClient';
import { useAdminAuth } from '../context/adminAuthContext';
import FancyInput from '../../component/FancyInput';

const ReservationForm = () => {
    const { guestDetails, setGuestDetails, guestCount, saveReservationId, restDetails } = useGuest();
    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState('');

    const navigate = useNavigate();


    const validate = () => {
        const errs = {};
        if (!guestDetails.name.trim()) {
            errs.name = 'Full name is required';
        }
        if (!guestDetails.phone.trim()) {
            errs.phone = 'Phone number is required';
        } else if (!/^\d{7,15}$/.test(guestDetails.phone.trim())) {
            errs.phone = 'Enter a valid phone number (7–15 digits)';
        }
        if (!guestDetails.email.trim()) {
            errs.email = 'Email is required';
        } else if (
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                guestDetails.email.trim()
            )
        ) {
            errs.email = 'Enter a valid email address';
        }
        return errs;
    };

    const handleChange = (e) => {
        setGuestDetails({ ...guestDetails, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const { name, phone, email } = guestDetails;

        // Save to Supabase
        const { data, error } = await supabase.from('queues').insert([
            {
                guests_count: guestCount,
                name,
                phone,
                email,
                restaurant_slug: restDetails?.slug
            }
        ]).select().single();

        if (error) {
            console.error('Failed to save to Supabase:', error.message);
            alert("Failed to save reservation. Please try again.");
            return;
        }
        saveReservationId(data.id)
        navigate(`/rest/${restDetails.slug}/result`);
    };



    const inputWrapper = (field, icon, type, placeholder) => (
        <div className="mb-4">
            <label className="text-md text-gray-800 block mb-1 capitalize ">
                {field.replace(/^\w/, (c) => c.toUpperCase())}
            </label>
            <div
                className={`flex items-center bg-gray-100 rounded-md px-3 py-4 w-full ${errors[field] ? 'border border-red-400 bg-red-50' : ''
                    }`}
            >
                <Icon icon={icon} className="text-gray-400 text-xl mr-2" />
                <input
                    type={type}
                    name={field}
                    value={guestDetails[field]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="bg-transparent w-full outline-none text-md "
                    required
                />
            </div>
            {errors[field] && (
                <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
            )}
        </div>
    );

    return (

        <form className='p-3'
            onSubmit={handleSubmit}

            noValidate
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Reserve Your Table
            </h2>
            <p className="text-md text-gray-500 mb-6">
                Enter your details to join the queue
            </p>

            <div className="w-full space-y-2 text-left">
                <FancyInput
                    field="name"
                    label="Full Name"
                    icon="lucide:user"
                    type="text"
                    placeholder="Enter your full name"
                    value={guestDetails.name}
                    onChange={handleChange}
                    error={errors.name}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                />

                <FancyInput
                    field="phone"
                    label="Phone Number"
                    icon="lucide:phone"
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={guestDetails.phone}
                    onChange={handleChange}
                    error={errors.phone}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                />

                <FancyInput
                    field="email"
                    label="Email"
                    icon="lucide:mail"
                    type="email"
                    placeholder="you@example.com"
                    value={guestDetails.email}
                    onChange={handleChange}
                    error={errors.email}
                    focusedField={focusedField}
                    setFocusedField={setFocusedField}
                />

                <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2.5 w-full rounded-lg  transition text-lg font-medium"
                >
                    Confirm Reservation
                </button>
            </div>

            <p className="mt-6 flex items-center justify-center  text-md text-gray-700 bg-orange-50 gap-2 py-2 rounded-lg">
                <Icon
                    icon="zondicons:exclamation-solid"
                    className="text-orange-500 w-4 h-4"
                />
                <span>
                    You will receive a confirmation message.
                </span>
            </p>
        </form>

    );
};

export default ReservationForm;
