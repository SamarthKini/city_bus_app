const OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving";

/**
 * Get suggested driving geometry for each contiguous run of routable stops.
 * Runs are separated by invalid or deliberately non-routable stops, so the
 * service never bridges an unverified geographic gap.
 */
export async function fetchSuggestedRoadSegments(stops, signal) {
  const runs = [];
  let currentRun = [];

  stops.forEach((stop) => {
    if (stop.coordinates && stop.routable !== false) {
      currentRun.push(stop);
    } else {
      if (currentRun.length > 1) runs.push(currentRun);
      currentRun = [];
    }
  });
  if (currentRun.length > 1) runs.push(currentRun);

  if (runs.length === 0) return { segments: [], failedRuns: 0 };

  const segments = [];
  let failedRuns = 0;
  for (const [index, run] of runs.entries()) {
    // The public OSRM demo asks clients to stay at or below one request per
    // second. Separate requests for routes split by invalid coordinate gaps.
    if (index > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
      if (signal?.aborted) throw new DOMException("Route request aborted", "AbortError");
    }
    const coordinates = run
      .map(({ coordinates: point }) => `${point.longitude},${point.latitude}`)
      .join(";");
    const url = `${OSRM_BASE_URL}/${coordinates}?overview=full&geometries=geojson&steps=false`;

    try {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        failedRuns += 1;
        continue;
      }
      const payload = await response.json();
      const geometry = payload.code === "Ok" ? payload.routes?.[0]?.geometry?.coordinates : null;
      if (!Array.isArray(geometry) || geometry.length < 2) {
        failedRuns += 1;
        continue;
      }
      segments.push(geometry.map(([longitude, latitude]) => [latitude, longitude]));
    } catch (error) {
      if (error.name === "AbortError") throw error;
      failedRuns += 1;
    }
  }

  return { segments, failedRuns };
}
