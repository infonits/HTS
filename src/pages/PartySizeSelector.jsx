import React, { useState, useEffect } from 'react';

const PartySizeSelector = () => {
  const [guestCount, setGuestCount] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const increaseCount = () => {
    if (guestCount < 16) {
      setIsAnimating(true);
      setGuestCount(guestCount + 1);

      // Trigger vibration for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(50); // 50ms vibration
      }

      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const decreaseCount = () => {
    if (guestCount > 1) {
      setIsAnimating(true);
      setGuestCount(guestCount - 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const handleConfirm = () => {
    setShowConfetti(true);
    setTimeout(() => {
      // navigate(`/rest/${restDetails.slug}/step1`);
      console.log('Navigating to next step...');
    }, 800);
  };

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 rounded-full ${showConfetti ? 'animate-bounce' : 'opacity-0'
        }`}
      style={{
        backgroundColor: ['#f97316', '#ef4444', '#f59e0b', '#10b981'][i % 4],
        left: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 0.5}s`,
        animationDuration: `${0.8 + Math.random() * 0.4}s`,
      }}
    />
  ));

  return (
    <div className="relative flex flex-col   overflow-hidden">


      {/* Confetti overlay */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {confettiParticles}
        </div>
      )}

      <div className="relative z-20">
        {/* Header with slide-in animation */}
        <div className="transform transition-all duration-700 ease-out animate-fadeInUp">
          <h2 className="text-2xl font-bold text-gray-800 my-5 text-center">
            Select Guests Count
          </h2>
          <p className="text-md text-gray-500 mb-8 text-center">
            How many people will be dining?
          </p>
        </div>

        {/* Counter section with enhanced animations */}
        <div className="flex items-center justify-center gap-8 mb-10 transform transition-all duration-500 ease-out">
          <button
            onClick={decreaseCount}
            disabled={guestCount <= 1}
            className="group relative w-14 h-14 bg-white border-2 border-gray-200 text-2xl rounded-full text-gray-600 hover:border-orange-300 hover:bg-orange-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-400 ease-out transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 flex items-center justify-center shadow-md hover:shadow-lg disabled:hover:scale-100 disabled:hover:translate-y-0"
          >
            <span className="transition-all duration-300 ease-out group-active:scale-75 group-hover:scale-110">−</span>
            <div className="absolute inset-0 rounded-full bg-orange-100 opacity-0 group-hover:opacity-60 transition-all duration-400 ease-out" />
          </button>

          {/* Animated counter display */}
          <div className="flex flex-col items-center relative">
            <div className="relative overflow-hidden">
              <div className={`block text-6xl md:text-7xl font-extrabold bg-gradient-to-br from-orange-500 to-red-500 bg-clip-text text-transparent transition-all duration-500 ease-out transform ${isAnimating ? 'scale-110 rotate-3' : 'scale-100 rotate-0'
                }`}>
                {guestCount}
              </div>
              {/* Subtle ripple effect */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-orange-200 to-red-200 transition-all duration-500 ease-out ${isAnimating ? 'scale-125 opacity-0' : 'scale-0 opacity-0'
                }`} />
            </div>
            <span className="text-md text-gray-600 mt-1 transition-all duration-200">
              {guestCount === 1 ? 'Person' : 'People'}
            </span>


          </div>

          <button
            onClick={increaseCount}
            disabled={guestCount >= 16}
            className="group relative w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl rounded-full hover:from-orange-600 hover:to-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-400 ease-out transform hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0 flex items-center justify-center shadow-md hover:shadow-xl disabled:hover:scale-100 disabled:hover:translate-y-0 animate-pulse-on-click"
          >
            <span className="transition-all duration-300 ease-out group-active:scale-75 group-hover:scale-110">+</span>
            <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-all duration-400 ease-out" />
          </button>
        </div>

        {/* Info text with fade animation */}
        <p className="text-md text-gray-400 text-center mb-10 transition-all duration-300 transform hover:text-gray-500">
          Maximum 16 people per reservation
        </p>

        {/* Enhanced confirm button */}
        <button
          onClick={handleConfirm}
          className="group relative bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-lg font-medium py-3.5 px-4 w-full rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden"
        >
          <span className="relative z-10 transition-transform duration-200 group-active:scale-95">
            Confirm Selection ({guestCount} {guestCount === 1 ? 'Guest' : 'Guests'})
          </span>

          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-700" />

          {/* Pulse effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-30 animate-pulse" />
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes vibrate {
          0%, 100% { transform: translateX(0); }
          10% { transform: translateX(-2px); }
          20% { transform: translateX(2px); }
          30% { transform: translateX(-2px); }
          40% { transform: translateX(2px); }
          50% { transform: translateX(-1px); }
          60% { transform: translateX(1px); }
          70% { transform: translateX(-1px); }
          80% { transform: translateX(1px); }
          90% { transform: translateX(0); }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-pulse-on-click:active {
          animation: vibrate 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default PartySizeSelector;