import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

const ReservationForm = () => {
    const [form, setForm] = useState({ name: '', phone: '', email: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) {
            errs.name = 'Full name is required';
        }
        if (!form.phone.trim()) {
            errs.phone = 'Phone number is required';
        } else if (!/^\d{7,15}$/.test(form.phone.trim())) {
            errs.phone = 'Enter a valid phone number (7–15 digits)';
        }
        if (!form.email.trim()) {
            errs.email = 'Email is required';
        } else if (
            !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                form.email.trim()
            )
        ) {
            errs.email = 'Enter a valid email address';
        }
        return errs;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: undefined });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        // all good, proceed
        navigate('/user/result');
    };

    const inputWrapper = (field, icon, type, placeholder) => (
        <div className="mb-4">
            <label className="text-md text-gray-700 block mb-1 capitalize">
                {field.replace(/^\w/, (c) => c.toUpperCase())}
            </label>
            <div
                className={`flex items-center bg-gray-100 rounded-md px-3 py-2 w-full ${errors[field] ? 'border border-red-400 bg-red-50' : ''
                    }`}
            >
                <Icon icon={icon} className="text-orange-500 text-lg mr-2" />
                <input
                    type={type}
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="bg-transparent w-full outline-none text-md"
                    required
                />
            </div>
            {errors[field] && (
                <p className="text-xs text-red-600 mt-1">{errors[field]}</p>
            )}
        </div>
    );

    return (

        <form
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
                {inputWrapper(
                    'name',
                    'mdi:user',
                    'text',
                    'Enter your full name'
                )}
                {inputWrapper(
                    'phone',
                    'mdi:phone',
                    'tel',
                    'Enter your phone number'
                )}
                {inputWrapper(
                    'email',
                    'mdi:email',
                    'email',
                    'Enter your email address'
                )}
                <button
                    type="submit"
                    className="bg-orange-500 text-white py-2.5 w-full rounded-lg hover:bg-orange-600 transition text-lg font-medium"
                >
                    Confirm Reservation
                </button>
            </div>

            <p className="mt-6 flex items-center justify-center gap-2 text-md text-gray-700 bg-orange-50 px-4 py-2 rounded-lg">
                <Icon
                    icon="zondicons:exclamation-solid"
                    className="text-orange-500 w-8 h-8"
                />
                <span>
                    You will receive a confirmation message with your reservation
                    number.
                </span>
            </p>
        </form>

    );
};

export default ReservationForm;
