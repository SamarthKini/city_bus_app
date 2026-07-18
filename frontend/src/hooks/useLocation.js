import { useEffect, useState } from "react";

const geolocationSupported = typeof navigator !== "undefined" && Boolean(navigator.geolocation);

const initialLocation = {
  latitude: null,
  longitude: null,
  error: geolocationSupported ? "" : "Geolocation is not supported by this browser.",
  isLoading: geolocationSupported,
};

export default function useLocation() {
  const [location, setLocation] = useState(initialLocation);

  useEffect(() => {
    if (!geolocationSupported) {
      return undefined;
    }

    function updatePosition(position) {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        error: "",
        isLoading: false,
      });
    }

    function handleError(error) {
      setLocation((currentLocation) => ({
        ...currentLocation,
        error: error.message || "Unable to retrieve your location.",
        isLoading: false,
      }));
    }

    navigator.geolocation.getCurrentPosition(updatePosition, handleError);

    const watchId = navigator.geolocation.watchPosition(
      updatePosition,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
}
