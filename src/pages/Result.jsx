import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Result() {
    const navigate = useNavigate()

    const handleBackHome = () => {
        navigate('/step1')
    }
    return (
        <div className=" bg-white shadow-md rounded-lg max-w-sm mx-auto bg-white min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pt-12">
                <button className="p-2">
                    <iconify-icon icon="material-symbols:arrow-back" className="w-6 h-6 text-gray-700"></iconify-icon>
                </button>
                <button className="p-2">
                    <iconify-icon icon="material-symbols:more-horiz" className="w-6 h-6 text-orange-400"></iconify-icon>
                </button>
            </div>

            {/* Success Icon */}
            <div className="flex justify-center mt-8 mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <iconify-icon icon="material-symbols:check" className="w-8 h-8 text-orange-500"></iconify-icon>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-2">
                <h1 className="text-2xl font-semibold text-gray-800">Spice House</h1>
                <p className="text-gray-500 text-sm">Table Reserved Successfully</p>
            </div>

            {/* Reservation Details Card */}
            <div className="mx-4 mt-8 bg-orange-50 rounded-2xl p-6">
                <div className="mb-4">
                    <p className="text-orange-600 text-sm font-medium mb-1">Reservation Number</p>
                    <p className="text-2xl font-bold text-orange-600">#R042</p>
                </div>

                <div>
                    <p className="text-gray-600 text-sm font-medium mb-1">Estimated Waiting Time</p>
                    <p className="text-xl font-semibold text-gray-800">Approx. 12 minutes</p>
                </div>
            </div>

            {/* Queue Status */}
            <div className="mx-4 mt-6 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span className="text-gray-600 text-sm">Queue Position</span>
                </div>
                <span className="font-semibold text-gray-800">3rd in line</span>
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