import React from 'react'
import PartySizeSelector from './PartySizeSelector'
import { Icon } from '@iconify/react/dist/iconify.js';
import { Outlet, useNavigate } from 'react-router-dom';

export default function UserPage() {
    const navigate = useNavigate();
    const handleBack = () => {
        navigate(-1)
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white h-screen shadow-xl rounded-2xl w-full max-w-sm text-center flex flex-col">

                {/* Sticky Top Nav */}
                <div className="sticky top-0 bg-white shadow-sm border-b border-gray-100 z-10">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={handleBack}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <Icon icon="formkit:arrowleft" width="16" height="9" className="text-gray-600" />
                        </button>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <Icon icon="mdi:utensils-variant" width="24" height="24" className="text-white" />
                            </div>
                            <span className="text-lg font-semibold text-gray-800">Dine In Place</span>
                        </div>

                        <div className="w-10 h-10" />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 flex justify-center items-center">
                    {/* <PartySizeSelector /> */}
                    <Outlet />
                </div>
            </div>
            <div>

            </div>
        </div>

    )
}
