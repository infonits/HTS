import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PartySizeSelector = () => {
  const [count, setCount] = useState(2);
  const navigate = useNavigate();

  const increaseCount = () => {
    if (count < 8) setCount(count + 1);
  };

  const decreaseCount = () => {
    if (count > 1) setCount(count - 1);
  };

  const handleConfirm = () => {
    navigate('/step1');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white h-screen shadow-xl rounded-2xl p-8 w-full max-w-sm text-center flex items-center flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Party Size</h2>
        <p className="text-sm text-gray-500 mb-6">How many people will be dining?</p>

        <div className="flex items-center justify-center gap-6 mb-8">
          <button
            onClick={decreaseCount}
            className="w-12 h-12 bg-gray-200 text-2xl rounded-full text-gray-700 hover:bg-gray-300 transition"
          >
            −
          </button>
          <div className='flex flex-col'>
            <span className="text-6xl font-extrabold text-orange-500">{count}</span>
            <span className='text-sm'>People</span>
          </div>
          <button
            onClick={increaseCount}
            className="w-12 h-12 bg-orange-500 text-white text-2xl rounded-full hover:bg-orange-600 transition"
          >
            +
          </button>
        </div>

        <p className="text-xs text-gray-400 my-10">Maximum 8 people per reservation</p>

        <button
          onClick={handleConfirm}
          className="bg-orange-500 text-white text-base font-medium py-2.5 px-4 w-full rounded-lg hover:bg-orange-600 transition"
        >
          Confirm Selection
        </button>
      </div>
    </div>
  );
};

export default PartySizeSelector;
