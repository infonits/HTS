
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/guestContext';

const PartySizeSelector = () => {
  const { guestCount, setGuestCount, restDetails } = useGuest();

  const navigate = useNavigate();

  const increaseCount = () => {
    if (guestCount < 16) setGuestCount(guestCount + 1);
  };

  const decreaseCount = () => {
    if (guestCount > 1) setGuestCount(guestCount - 1);
  };

  const handleConfirm = () => {
    navigate(`/rest/${restDetails.slug}/step1`);
  };

  return (
    <div className='flex flex-col'>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Guests Count</h2>
      <p className="text-md text-gray-500 mb-6">How many people will be dining?</p>

      <div className="flex items-center justify-center gap-6 mb-8">
        <button onClick={decreaseCount} className="w-12 h-12 bg-gray-200 text-2xl rounded-full text-gray-700 hover:bg-gray-300 transition">−</button>
        <div className='flex flex-col'>
          <span className="text-6xl font-extrabold text-orange-500">{guestCount}</span>
          <span className='text-md'>People</span>
        </div>
        <button onClick={increaseCount} className="w-12 h-12 bg-orange-500 text-white text-2xl rounded-full hover:bg-orange-600 transition">+</button>
      </div>

      <p className="text-md text-gray-400 my-10">Maximum 16 people per reservation</p>

      <button
        onClick={handleConfirm}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-white text-lg font-medium py-2.5 px-4 w-full rounded-lg transition"
      >
        Confirm Selection
      </button>
    </div>
  );
};

export default PartySizeSelector;
