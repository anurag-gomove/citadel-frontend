
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Property } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/format-currency";
import { Building2, DollarSign, Home, MapPin, Users, X } from "lucide-react";

// This will be replaced by the Supabase secret or a user-provided token
const MAPBOX_PLACEHOLDER_TOKEN = "pk.eyJ1IjoibG92YWJsZS1kZXYiLCJhIjoiY2xzYnBhaXB4MDN0dDJrcGR0ZTRoMnZpYiJ9.qLDVj9tLmavQQR2pRZ4RsA";

interface PropertyMapProps {
  properties: Property[];
  onPropertySelect?: (property: Property) => void;
  selectedProperty?: Property | null;
}

export function PropertyMap({ properties, onPropertySelect, selectedProperty }: PropertyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isMapError, setIsMapError] = useState(false);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const activePopupRef = useRef<mapboxgl.Popup | null>(null);
  const markerElementsRef = useRef<HTMLDivElement[]>([]);
  const popupsRef = useRef<mapboxgl.Popup[]>([]);
  const propertyPopupsMapRef = useRef<Map<string, mapboxgl.Popup>>(new Map());
  const boundsRef = useRef<mapboxgl.LngLatBounds | null>(null);

  // Fetch the Mapbox token
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        console.log("Fetching Mapbox token from Supabase function...");
        
        // Try to get token from Supabase
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error("Error invoking get-mapbox-token function:", error);
          setErrorDetails(`Function error: ${error.message}`);
          // Fallback to placeholder token
          setMapboxToken(MAPBOX_PLACEHOLDER_TOKEN);
          return;
        }
        
        if (!data?.token) {
          console.warn("No token returned from get-mapbox-token function");
          setErrorDetails("No token returned from function");
          // Fallback to placeholder token
          setMapboxToken(MAPBOX_PLACEHOLDER_TOKEN);
          return;
        }
        
        console.log("Successfully retrieved Mapbox token");
        setMapboxToken(data.token);
      } catch (error) {
        console.error("Exception fetching Mapbox token:", error);
        setErrorDetails(`Exception: ${error instanceof Error ? error.message : String(error)}`);
        // Fallback to placeholder token
        setMapboxToken(MAPBOX_PLACEHOLDER_TOKEN);
      }
    };

    fetchMapboxToken();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || mapInitialized) return;

    try {
      console.log("Initializing Mapbox with token:", mapboxToken.substring(0, 10) + "...");
      
      // Initialize Mapbox
      mapboxgl.accessToken = mapboxToken;

      // Create map with default center instead of using property coordinates
      console.log("Creating map instance...");
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [-98.5795, 39.8283], // Default to center of US
        zoom: 3, // Start zoomed out
      });

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      
      // Track when map loads successfully
      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
        setMapInitialized(true);
      });
      
      // Handle map load error
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setIsMapError(true);
        setErrorDetails(e.error ? e.error.message : 'Unknown Mapbox error');
      });
    } catch (error) {
      console.error("Error initializing map:", error);
      setIsMapError(true);
      setErrorDetails(error instanceof Error ? error.message : String(error));
    }
  }, [properties, mapboxToken]);

  // Cleanup function
  useEffect(() => {
    return () => {
      console.log("PropertyMap component unmounting, cleaning up map instance");
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMapInitialized(false);
      }
    };
  }, []);

  // Add or update markers when properties change or map is initialized
  useEffect(() => {
    if (!map.current || !mapInitialized) return;

    console.log("Adding markers to map...");
    
    // Clear existing markers and popups
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    markerElementsRef.current = [];
    
    if (activePopupRef.current) {
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }
    
    popupsRef.current.forEach(popup => popup.remove());
    popupsRef.current = [];
    
    // Clear property popups map
    propertyPopupsMapRef.current.clear();

    // Create bounds to fit all properties
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;

    // Helper function to get property image HTML
    const getPropertyImageHtml = async (property: Property) => {
      if (!property.image_url) {
        return `<div class="property-image property-image-placeholder">
                  <span class="text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
                </div>`;
      }

      // Check if it's already a full URL
      if (property.image_url.startsWith('http')) {
        return `<div class="property-image" style="background-image: url('${property.image_url}')"></div>`;
      }

      // If it's a storage path, get the public URL
      try {
        const { data } = supabase.storage
          .from('properties')
          .getPublicUrl(property.image_url);
          
        if (data?.publicUrl) {
          return `<div class="property-image" style="background-image: url('${data.publicUrl}')"></div>`;
        }
      } catch (error) {
        console.error("Error loading image:", error);
      }

      // Fallback
      return `<div class="property-image property-image-placeholder">
                <span class="text-white/80"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
              </div>`;
    };

    // Add markers for each property with coordinates
    properties.forEach(async (property, index) => {
      if (property.longitude && property.latitude) {
        const coordinates: mapboxgl.LngLatLike = [property.longitude, property.latitude];
        bounds.extend(coordinates);
        hasValidCoordinates = true;

        // Create marker element
        const el = document.createElement('div');
        el.className = 'property-marker';
        el.style.backgroundColor = '#8B5CF6';
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.borderRadius = '50%';
        el.style.display = 'flex';
        el.style.justifyContent = 'center';
        el.style.alignItems = 'center';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        el.style.cursor = 'pointer';
        markerElementsRef.current.push(el);
        
        // Update marker content to show index + 1 (for human readable numbering)
        el.innerHTML = `<span style="color:white;font-weight:bold;font-size:10px;">${index + 1}</span>`;
        
        // Get property image HTML
        const imageHtml = await getPropertyImageHtml(property);
        
        // Format units display
        const totalUnits = property.total_units || 0;
        const occupiedUnits = property.occupied_units || 0;
        const monthlyIncome = property.actual_income || 0;
        
        // Create a new popup for this marker (but don't attach it yet)
        const popup = new mapboxgl.Popup({
          offset: [0, -15],
          maxWidth: 'none', // Allow popup to be wider
          className: 'property-popup',
          anchor: 'bottom', // Position popup above the marker
          closeButton: false, // We'll use our custom close button
          closeOnClick: false
        }).setHTML(`
          <div class="airbnb-style-card">
            <div class="property-image-container">
              ${imageHtml}
              <div class="property-badge">${index + 1}</div>
              <button class="close-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div class="property-content">
              <h3 class="property-title">${property.name}</h3>
              <p class="property-address">${property.address}, ${property.city} ${property.province || ''} ${property.postal_code || ''}</p>
              
              <div class="property-stats">
                <div class="stat-item">
                  <span class="stat-label">Type</span>
                  <span class="stat-value">${property.type || 'Property'}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Units</span>
                  <span class="stat-value">${occupiedUnits}/${totalUnits}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Monthly</span>
                  <span class="stat-value">${formatCurrency(monthlyIncome)}</span>
                </div>
              </div>
              
              <a href="/properties/${property.id}" class="view-details-button">View Details</a>
            </div>
          </div>
        `);
        
        // Store the popup for later reference
        popupsRef.current.push(popup);
        
        // Store in our map for easier lookup by property ID
        propertyPopupsMapRef.current.set(property.id, popup);

        // Add marker to map
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current!);
          
        // Store marker reference for later cleanup
        markersRef.current.push(marker);

        // Add click event to marker
        el.addEventListener('click', (e) => {
          console.log(`Marker clicked for property: ${property.name}`);
          
          // Close any existing popup
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }
          
          // Set current popup as active and show it
          activePopupRef.current = popup;
          marker.setPopup(popup); // Attach popup to marker
          popup.addTo(map.current!); // This line is key - directly add the popup to the map
          
          // Add click handler to close button in popup
          setTimeout(() => {
            const closeButton = document.querySelector('.property-popup .close-button');
            if (closeButton) {
              closeButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (activePopupRef.current) {
                  activePopupRef.current.remove();
                  activePopupRef.current = null;
                }
              });
            }
            
            // Add click handlers to the view details button
            const viewDetailsButton = document.querySelector('.property-popup .view-details-button');
            if (viewDetailsButton) {
              viewDetailsButton.addEventListener('click', (e) => {
                // Navigate to property details page
                // (this is handled by the href attribute)
              });
            }
          }, 100);
          
          if (onPropertySelect) {
            onPropertySelect(property);
          }

          // Stop event propagation to prevent map click
          e.stopPropagation();
        });
      }
    });

    // Store the bounds for later use
    boundsRef.current = bounds;

    // Fit map to property bounds if we have valid coordinates
    if (hasValidCoordinates && !bounds.isEmpty()) {
      map.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 15,
        duration: 1000
      });
    }
    
    // Add custom CSS for the popup
    const style = document.createElement('style');
    style.innerHTML = `
      .mapboxgl-popup {
        z-index: 10;
        max-width: 450px !important;
        width: 450px !important;
      }
      
      .mapboxgl-popup-content {
        padding: 0 !important;
        overflow: hidden !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15) !important;
        width: 100% !important;
      }
      
      .mapboxgl-popup-close-button {
        display: none !important;
      }
      
      .close-button {
        position: absolute;
        top: 8px;
        right: 8px;
        background: white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 5;
        padding: 0;
        color: #666;
      }
      
      .close-button:hover {
        background: #f5f5f5;
      }
      
      .airbnb-style-card {
        display: flex;
        flex-direction: column;
        width: 100%;
        background: white;
      }
      
      .property-image-container {
        position: relative;
        width: 100%;
        height: 220px;
      }
      
      .property-image {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
      }
      
      .property-image-placeholder {
        background-color: #8B5CF6;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .property-content {
        padding: 16px;
      }
      
      .property-badge {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #8B5CF6;
        color: white;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        z-index: 1;
      }
      
      .property-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: #222;
      }
      
      .property-address {
        color: #717171;
        font-size: 14px;
        margin: 0 0 16px 0;
      }
      
      .property-stats {
        display: flex;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f0f0f0;
      }
      
      .stat-item {
        display: flex;
        flex-direction: column;
      }
      
      .stat-label {
        font-size: 12px;
        color: #717171;
        margin-bottom: 4px;
      }
      
      .stat-value {
        font-weight: 500;
        color: #222;
      }
      
      .view-details-button {
        display: inline-block;
        background-color: #8B5CF6;
        color: white;
        padding: 8px 16px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 500;
        text-align: center;
        transition: background-color 0.2s;
      }
      
      .view-details-button:hover {
        background-color: #7C3AED;
      }
      
      .mapboxgl-popup-anchor-bottom .mapboxgl-popup-tip,
      .mapboxgl-popup-anchor-bottom-left .mapboxgl-popup-tip,
      .mapboxgl-popup-anchor-bottom-right .mapboxgl-popup-tip {
        border-top-color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, [properties, mapInitialized, onPropertySelect]);
  
  // Method to show popup for a property (called when property is selected)
  const showPropertyPopup = (property: Property) => {
    if (!map.current || !mapInitialized) {
      console.warn("Map not initialized yet, cannot show popup");
      return;
    }
    
    console.log(`Showing popup for property: ${property.name}`);
    
    // Check if the property has coordinates
    if (!property.longitude || !property.latitude) {
      console.warn(`Property ${property.name} has no coordinates`);
      return;
    }
    
    // Close any existing popup first
    if (activePopupRef.current) {
      console.log("Closing existing popup before showing new one");
      activePopupRef.current.remove();
      activePopupRef.current = null;
    }
    
    // Get the popup from our map by property ID
    const popup = propertyPopupsMapRef.current.get(property.id);
    
    if (!popup) {
      console.warn(`Popup for property ${property.name} (ID: ${property.id}) not found`);
      return;
    }
    
    console.log("Found popup, showing popup directly");
    
    // Set as active popup and show it
    activePopupRef.current = popup;
    
    // Add popup to map directly at the property's coordinates
    popup.setLngLat([property.longitude, property.latitude]);
    popup.addTo(map.current);
    
    // Add event listener to close button
    setTimeout(() => {
      const closeButton = document.querySelector('.property-popup .close-button');
      if (closeButton) {
        closeButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (activePopupRef.current) {
            activePopupRef.current.remove();
            activePopupRef.current = null;
          }
        });
      }
    }, 100);
  };

  // When selectedProperty changes, show its popup and center map on it
  useEffect(() => {
    if (selectedProperty && properties.length > 0 && mapInitialized && map.current) {
      console.log(`Selected property changed to: ${selectedProperty.name}, showing popup`);
      
      // Close any existing popup first
      if (activePopupRef.current) {
        activePopupRef.current.remove();
        activePopupRef.current = null;
      }
      
      // Show popup for the selected property
      showPropertyPopup(selectedProperty);
      
      // If selected property has coordinates, pan to it
      if (selectedProperty.longitude && selectedProperty.latitude) {
        map.current.flyTo({
          center: [selectedProperty.longitude, selectedProperty.latitude],
          zoom: 15,
          duration: 1000
        });
      }
    } else if (!selectedProperty && boundsRef.current && !boundsRef.current.isEmpty() && map.current && mapInitialized) {
      // If no property is selected and we have bounds, fit to all properties
      map.current.fitBounds(boundsRef.current, {
        padding: 60,
        maxZoom: 15,
        duration: 1000
      });
    }
  }, [selectedProperty, properties, mapInitialized]);

  if (isMapError) {
    return (
      <div className="h-[calc(100vh-12rem)] w-full rounded-lg overflow-hidden border border-border flex flex-col items-center justify-center p-6 bg-muted/20">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">Map unavailable</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Unable to load the map. This could be due to a missing or invalid Mapbox token.
          </p>
          <p className="text-xs text-muted-foreground">
            Error details: {errorDetails || "No error details available"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] w-full rounded-lg overflow-hidden">
      <div ref={mapContainer} className="h-full w-full" />
      {!mapboxToken && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-muted-foreground mb-2">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
}
