
import { Icon } from '@iconify/react/dist/iconify.js';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useGuest } from '../context/guestContext';

export default function UserPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { restDetails } = useGuest()
    const hideBackButton =
        location.pathname === '/vendor' ||
        location.pathname === `/rest/${encodeURIComponent(restDetails?.slug || '')}` ||
        location.pathname.startsWith(`/rest/${encodeURIComponent(restDetails?.slug || '')}/result`);

    const handleBack = () => {
        navigate(-1)
    };
    return (
        <div className="min-h-screen flex   justify-center  sm:px-4 px-0 bg-gradient-to-br from-orange-50 to-orange-100 ">
            <div className=" w-full sm:max-w-md   text-center p-5 mt-3">

                {/* Sticky Top Nav */}
                <div className=" bg-gradient-to-r from-slate-700 to-slate-800 text-white shadow-sm border-b border-gray-100  shadow-xl rounded-t-2xl">
                    <div className="flex items-center justify-between px-4 py-3">
                        {hideBackButton ? (
                            <div className="w-10 h-10" />
                        ) : (
                            <button
                                onClick={handleBack}
                                className="flex items-center justify-center w-10 h-10 rounded-full 
               bg-gray-600 hover:bg-gray-700 transition-colors"
                            >
                                <Icon
                                    icon="formkit:arrowleft"
                                    width="16"
                                    height="9"
                                    className="text-white"
                                />
                            </button>
                        )}


                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <Icon icon="mdi:utensils-variant" width="24" height="24" className="text-white" />
                            </div>
                            <span className="text-lg font-semibold">{restDetails?.name}</span>
                        </div>

                        <div className="w-10 h-10" />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 p-8 bg-white  shadow-xl rounded-b-2xl mb-2">

                    <Outlet />
                </div>

                <div className='p-1 flex justify-around md:justify-between text-sm text-gray-500  mb-2'>
                    <span>

                        Dev by <a href="https://www.infonits.io" target='_blank' className='font-semibold'>infonits</a> | © 2025
                    </span>

                    <span>
                        <a href="https://www.queuegenix.com/privacy" target='_blank'>
                            Privacy Policy
                        </a>
                        {" "} | <span className='font-semibold'>
                            v1.0.0
                        </span>
                    </span>
                </div>
            </div>
        </div>

    )
}
