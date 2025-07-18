import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';

export default function Result() {
    const [show, setShow] = useState(false);

    const navigate = useNavigate()
    useEffect(() => {
        // Trigger animation after mount (or after success event)
        setShow(true);
    }, []);

    const handleBackHome = () => {
        navigate('/user')
    }
    return (
        <div className='w-full'>


            {/* Success Icon */}
            <div className="flex flex-col items-center gap-2 justify-center mb-8">
                <div className="w-16 h-16 bg-green-700 rounded-full flex items-center justify-center">
                    <Icon
                        icon="qlementine-icons:check-tick-16"
                        className="text-white w-10 h-10"
                    />

                </div>

                <p className="text-gray-500 text-lg font-semibold">Table Reserved Successfully</p>

            </div>

            {/* Reservation Details Card */}
            <div className=" shadow-lg  rounded-2xl p-3 text-center">
                <div className="mb-4">
                    <p className="text-orange-600 text-md font-medium mb-1">Reservation Number</p>
                    <p className="text-4xl font-bold text-orange-600">#R042</p>
                </div>

                <div className='bg-orange-100 rounded-2xl p-2'>
                    <p className="text-md font-semibold text-gray-800">You are 4th in the queue</p>
                    <p className="text-orange-600 text-md font-medium mb-1">Estimated wait time: 15-30 minutes</p>
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
            <div className="mt-3 space-y-3">
                <button className="w-full bg-orange-500 text-white py-2 rounded-xl font-normal text-md over:bg-orange-600 transition-colors" onClick={handleBackHome}>
                    Back to Home
                </button>

            </div>
        </div>
    );
}