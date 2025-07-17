import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockVendors = [
  {
    id: 1,
    name: 'Salon Elegant',
    logo: 'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740',
  },
  {
    id: 2,
    name: 'Glow & Go',
    logo: 'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740',
  },
  {
    id: 3,
    name: 'Beauty Bliss',
    logo: 'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740',
  },
  {
    id: 4,
    name: 'Trendy Styles',
    logo: 'https://img.freepik.com/free-vector/bird-colorful-logo-gradient-vector_343694-1365.jpg?semt=ais_hybrid&w=740',
  },
];

const VendorSelectionPage = () => {
  const [search, setSearch] = useState('');

  const navigate = useNavigate()

  const filteredVendors = mockVendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full p-4  ">
      <div className="flex flex-col justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-orange-600 mb-2">Select a Vendor</h1>
        <input
          type="text"
          placeholder="Search vendors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-orange-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 w-full max-w-md"
        />
      </div>
      <hr className="border-orange-300 mb-4" />

      <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 max-w-xl mx-auto">
        {filteredVendors.length > 0 ? (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              onClick={() => navigate('/user/')}
              className="flex items-center gap-4 p-4 border border-orange-200 rounded-lg hover:shadow-lg hover:border-orange-400 transition"
            >
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="w-12 h-12 object-cover rounded-full"
              />
              <span className="font-medium text-orange-800">{vendor.name}</span>
            </div>
          ))
        ) : (
          <p className="text-orange-600 text-center">No vendors found.</p>
        )}
      </div>
    </div>
  );
};

export default VendorSelectionPage;
