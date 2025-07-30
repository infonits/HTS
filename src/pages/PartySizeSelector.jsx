import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuest } from '../context/guestContext';

const PartySizeSelector = () => {
  const { guestCount, setGuestCount, restDetails } = useGuest();
  const [isLongPress, setIsLongPress] = useState(false);
  const [showWheel, setShowWheel] = useState(false);
  const longPressTimer = useRef(null);
  const repeatTimer = useRef(null);
  const wheelRef = useRef(null);

  const navigate = useNavigate();

  const decreaseCount = () => {
    if (guestCount > 1) {
      setGuestCount(guestCount - 1);
    }
  };

  const increaseCount = () => {
    if (guestCount < 16) {
      setGuestCount(guestCount + 1);
    }
  };

  const handleMouseDown = (action) => {
    action();
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      repeatTimer.current = setInterval(action, 150);
    }, 500);
  };

  const handleMouseUp = () => {
    clearTimeout(longPressTimer.current);
    clearInterval(repeatTimer.current);
    setIsLongPress(false);
  };

  const handleDirectSelect = (count) => {
    setGuestCount(count);
  };

  const handleWheelClick = () => {
    setShowWheel(!showWheel);
  };

  const handleWheelSelect = (count) => {
    setGuestCount(count);
    setShowWheel(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wheelRef.current && !wheelRef.current.contains(event.target)) {
        setShowWheel(false);
      }
    };

    if (showWheel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showWheel]);

  const handleConfirm = () => {
    navigate(`/rest/${restDetails.slug}/step1`);
  };

  return (
    <div className="flex flex-col p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Select Guests Count</h2>
      <p className="text-md text-gray-500 mb-8">How many people will be dining?</p>

      <div className="flex items-center justify-center gap-8 mb-8">
        <button
          onMouseDown={() => handleMouseDown(decreaseCount)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => handleMouseDown(decreaseCount)}
          onTouchEnd={handleMouseUp}
          disabled={guestCount <= 1}
          className="w-16 h-16 md:w-12 md:h-12 bg-gray-200 text-3xl md:text-2xl rounded-full text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-md hover:shadow-lg"
        >
          −
        </button>

        <div className="flex flex-col items-center relative" ref={wheelRef}>
          <button
            onClick={handleWheelClick}
            className="text-6xl md:text-7xl font-extrabold text-orange-500 transition-all duration-300 transform hover:scale-105 cursor-pointer select-none"
          >
            {guestCount}
          </button>
          <span className="text-md text-gray-600 mt-1 transition-all duration-200">People</span>

          {/* Scroll Wheel Popup */}
          {showWheel && (
            <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
              <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {Array.from({ length: 16 }, (_, i) => i + 1).map((count) => (
                  <button
                    key={count}
                    onClick={() => handleWheelSelect(count)}
                    className={`w-12 h-12 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-110 active:scale-95 ${guestCount === count
                      ? 'bg-orange-500 text-white shadow-lg scale-105'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 shadow-sm hover:shadow-md'
                      }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 text-center">Tap to select</p>
              </div>
            </div>
          )}
        </div>

        <button
          onMouseDown={() => handleMouseDown(increaseCount)}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={() => handleMouseDown(increaseCount)}
          onTouchEnd={handleMouseUp}
          disabled={guestCount >= 16}
          className="w-16 h-16 md:w-12 md:h-12 bg-orange-500 text-white text-3xl md:text-2xl rounded-full hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center shadow-md hover:shadow-lg"
        >
          +
        </button>
      </div>

      {/* Quick Select Numbers */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16].map((count) => (
          <button
            key={count}
            onClick={() => handleDirectSelect(count)}
            className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-110 active:scale-95 ${guestCount === count
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm hover:shadow-md'
              }`}
          >
            {count}
          </button>
        ))}
      </div>

      <p className="text-md text-gray-400 text-center mb-10 transition-all duration-200">
        Maximum 16 people per reservation
      </p>

      <button
        onClick={handleConfirm}
        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-medium py-3.5 px-4 w-full rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
      >
        Confirm Selection
      </button>
    </div>
  );
};

export default PartySizeSelector;