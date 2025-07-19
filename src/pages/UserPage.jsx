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
        <div className="min-h-screen flex   justify-center  sm:px-4 px-0">
            <div className=" w-full sm:max-w-sm   text-center">

                {/* Sticky Top Nav */}
                <div className=" bg-orange-500 text-white shadow-sm border-b border-gray-100 my-2 shadow-xl rounded-2xl">
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
                            <span className="text-lg font-semibold">Dine In Place</span>
                        </div>

                        <div className="w-10 h-10" />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 p-8 bg-white  shadow-xl rounded-2xl mb-2">

                    <Outlet />
                </div>

                <div className='p-3 shadow-xl rounded-2xl bg-white mb-2'>
                    Dev by infonits | © 2025
                    Privacy Policy | v1.0.0
                </div>
            </div>
        </div>

    )
}
