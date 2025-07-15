import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';

const ReservationForm = () => {
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/result');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-sm text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Reserve Your Table</h2>
                <p className="text-sm text-gray-500 mb-6">Enter your details to join the queue</p>

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    {/* Full Name */}
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Full Name</label>
                        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                            <Icon icon="mdi:user" className="text-orange-500 text-lg mr-2" />
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="bg-transparent w-full outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Phone Number</label>
                        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                            <Icon icon="mdi:phone" className="text-orange-500 text-lg mr-2" />
                            <input
                                type="tel"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                placeholder="Enter your phone number"
                                className="bg-transparent w-full outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div>
                        <label className="text-sm text-gray-700 block mb-1">Email Address</label>
                        <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                            <Icon icon="mdi:email" className="text-orange-500 text-lg mr-2" />
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="Enter your email address"
                                className="bg-transparent w-full outline-none text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="bg-orange-500 text-white py-2.5 w-full rounded-lg hover:bg-orange-600 transition text-base font-medium"
                    >
                        Confirm Reservation
                    </button>
                </form>

                <p className="text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    You will receive a confirmation message with your reservation number.
                </p>
            </div>
        </div>
    );
};

export default ReservationForm;
