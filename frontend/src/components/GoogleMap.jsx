import React from 'react';
import { MapPin } from 'lucide-react';

const GoogleMap = ({ lat, lon, name, address, className = "" }) => {
  // Check if coordinates are valid
  const hasValidCoordinates = lat && lon && !isNaN(lat) && !isNaN(lon);
  
  if (!hasValidCoordinates) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Location not available</p>
        </div>
      </div>
    );
  }

  // Create Google Maps embed URL (using basic embed without API key)
  const mapUrl = `https://www.google.com/maps?q=${lat},${lon}&hl=en&z=15&output=embed`;
  
  // OpenStreetMap fallback
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        onError={(e) => {
          // Fallback to static image if iframe fails
          e.target.style.display = 'none';
          const img = e.target.nextSibling;
          if (img) img.style.display = 'block';
        }}
      ></iframe>
      
      {/* Fallback OpenStreetMap */}
      <iframe
        src={osmUrl}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'none' }}
        allowFullScreen=""
        loading="lazy"
        onError={(e) => {
          // If OSM also fails, show placeholder
          e.target.style.display = 'none';
          const placeholder = e.target.nextSibling;
          if (placeholder) placeholder.style.display = 'flex';
        }}
      ></iframe>
      
      {/* Final fallback placeholder */}
      <div 
        className="w-full h-full bg-gray-100 flex items-center justify-center"
        style={{ display: 'none' }}
      >
        <div className="text-center text-gray-500">
          <MapPin className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Map unavailable</p>
        </div>
      </div>
      
      {/* Overlay for better interaction */}
      <div className="absolute inset-0 bg-transparent hover:bg-black hover:bg-opacity-10 transition-colors cursor-pointer"
           onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lon}`, '_blank')}
           title="Open in Google Maps">
      </div>
    </div>
  );
};

export default GoogleMap;
