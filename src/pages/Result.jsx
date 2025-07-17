import { Icon } from '@iconify/react/dist/iconify.js';
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Result() {
    const navigate = useNavigate()

    const handleBackHome = () => {
        navigate('/user')
    }
    return (
        <div >


            {/* Success Icon */}
            <div className="flex justify-center mt-8 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <Icon
                        icon="qlementine-icons:check-tick-16"
                        className="text-orange-500 w-8 h-8"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-2">
                <h1 className="text-2xl font-semibold text-gray-800">Spice House</h1>
                <p className="text-gray-500 text-sm">Table Reserved Successfully</p>
            </div>

            {/* Reservation Details Card */}
            <div className="mx-4 mt-8 shadow-lg  rounded-2xl p-6 text-center">
                <div className="mb-4">
                    <p className="text-orange-600 text-sm font-medium mb-1">Reservation Number</p>
                    <p className="text-4xl font-bold text-orange-600">#R042</p>
                </div>

                <div className='bg-orange-100 rounded-2xl p-4'>
                    <p className="text-md font-semibold text-gray-800">You are 4th in the queue</p>
                    <p className="text-orange-600 text-sm font-medium mb-1">Estimated wait time: 15-30 minutes</p>
                </div>

                <div className='p-1'>
                    <div ><div className="flex justify-between">

                        <p className='font-medium text-gray-600'>Date</p>
                        <p className='font-medium'>Today, Dec 27</p>
                    </div>
                        <hr className='border-gray-100 mt-2' />
                    </div>
                </div>
                <div className='p-1'>
                    <div ><div className="flex justify-between">

                        <p className='font-medium text-gray-600'>Time</p>
                        <p className='font-medium'>7.30 PM</p>
                    </div>
                        <hr className='border-gray-100 mt-2' />
                    </div>
                </div>
                <div className='p-1'>
                    <div ><div className="flex justify-between">

                        <p className='font-medium text-gray-600'>Party Size</p>
                        <p className='font-medium'>2 People</p>
                    </div>
                    </div>
                </div>
            </div>



            {/* Action Buttons */}
            <div className="mx-4 mt-8 space-y-3">
                <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold text-lg hover:bg-orange-600 transition-colors" onClick={handleBackHome}>
                    Back to Home
                </button>

            </div>
        </div>
    );
}