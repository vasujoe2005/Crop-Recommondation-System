function toRadians(value) {
  return (value * Math.PI) / 180;
}

export function closePolygon(coordinates) {
  if (!coordinates.length) {
    return [];
  }

  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  if (first.latitude === last.latitude && first.longitude === last.longitude) {
    return coordinates;
  }

  return [...coordinates, first];
}

export function buildPolygonGeoJSON(coordinates) {
  const closedCoordinates = closePolygon(coordinates);
  return {
    type: 'Polygon',
    coordinates: [
      closedCoordinates.map((point) => [point.longitude, point.latitude]),
    ],
  };
}

export function calculateCentroid(coordinates) {
  if (!coordinates.length) {
    return null;
  }

  const totals = coordinates.reduce(
    (accumulator, point) => ({
      latitude: accumulator.latitude + point.latitude,
      longitude: accumulator.longitude + point.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: totals.latitude / coordinates.length,
    longitude: totals.longitude / coordinates.length,
  };
}

export function calculateAreaInHectares(coordinates) {
  if (coordinates.length < 3) {
    return 0;
  }

  // This is a light-weight planar approximation suitable for quick UI feedback.
  const earthRadius = 6378137;
  const projected = coordinates.map((point) => ({
    x: earthRadius * toRadians(point.longitude) * Math.cos(toRadians(point.latitude)),
    y: earthRadius * toRadians(point.latitude),
  }));

  let area = 0;
  for (let index = 0; index < projected.length; index += 1) {
    const nextIndex = (index + 1) % projected.length;
    area += projected[index].x * projected[nextIndex].y;
    area -= projected[nextIndex].x * projected[index].y;
  }

  return Math.abs(area / 2) / 10000;
}

export function createGridBins(region) {
  const rows = 3;
  const columns = 3;
  const latStep = region.latitudeDelta / rows;
  const lonStep = region.longitudeDelta / columns;
  const startLat = region.latitude - region.latitudeDelta / 2;
  const startLon = region.longitude - region.longitudeDelta / 2;
  const bins = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const minLat = startLat + row * latStep;
      const minLon = startLon + column * lonStep;
      const maxLat = minLat + latStep;
      const maxLon = minLon + lonStep;

      bins.push({
        id: `${row}-${column}`,
        coordinates: [
          { latitude: minLat, longitude: minLon },
          { latitude: minLat, longitude: maxLon },
          { latitude: maxLat, longitude: maxLon },
          { latitude: maxLat, longitude: minLon },
        ],
        center: {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLon + maxLon) / 2,
        },
      });
    }
  }

  return bins;
}

export function getNearestBinIndex(coordinate, bins) {
  if (!bins.length) {
    return -1;
  }

  let nearestIndex = -1;
  let nearestDistance = Number.POSITIVE_INFINITY;

  bins.forEach((bin, index) => {
    const distance =
      Math.abs(bin.center.latitude - coordinate.latitude) +
      Math.abs(bin.center.longitude - coordinate.longitude);

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function binsToFeatureCollection(bins) {
  return {
    type: 'FeatureCollection',
    features: bins.map((bin) => ({
      type: 'Feature',
      properties: { id: bin.id },
      geometry: {
        type: 'Polygon',
        coordinates: [
          closePolygon(bin.coordinates).map((point) => [point.longitude, point.latitude]),
        ],
      },
    })),
  };
}

export function flattenCoordinates(bins) {
  return bins.flatMap((bin) => bin.coordinates);
}
