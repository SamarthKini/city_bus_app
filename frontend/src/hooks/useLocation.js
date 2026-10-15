import { useEffect, useState } from "react";

const geolocationSupported = typeof navigator !== "undefined" && Boolean(navigator.geolocation);

const initialLocation = {
  latitude: null,
  longitude: null,
  accuracy: null,
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
      const { latitude, longitude, accuracy } = position?.coords ?? {};
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
        || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: "The browser returned invalid location coordinates.",
          isLoading: false,
        });
        return;
      }
      setLocation({
        latitude,
        longitude,
        accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
        error: "",
        isLoading: false,
      });
    }

    function handleError(error) {
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: error.message || "Unable to retrieve your location.",
        isLoading: false,
      });
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
