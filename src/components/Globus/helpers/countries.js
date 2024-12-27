import * as THREE from 'three';

export const addCountryBorders = (earthSphere, geojson) => {
  const allBorders = new THREE.Group(); 

  geojson.features.forEach((country) => {
      if (!country.geometry || !country.properties) {
          console.warn('Missing geometry or properties for country:', country);
          return;
      }

      const { coordinates, type } = country.geometry;
      const countryName = country.properties.name || 'Unknown Country'; 

      if (type === "Polygon") {
          coordinates.forEach(ring => {
              const borderLine = createPolygonBorder(ring); 
              borderLine.userData.name = countryName;
              allBorders.add(borderLine); 
          });
      } else if (type === "MultiPolygon") {
          coordinates.forEach(polygon => {
              polygon.forEach(ring => {
                  const borderLine = createPolygonBorder(ring); 
                  borderLine.userData.name = countryName;
                  allBorders.add(borderLine); 
              });
          });
      }
  });

  earthSphere.add(allBorders); 
};

const createPolygonBorder = (ring) => {
  const points = [];

  if (Array.isArray(ring)) {
    ring.forEach(point => {
      if (Array.isArray(point) && point.length === 2) {
        const [lon, lat] = point; 
        const radius = 10; 
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        points.push(new THREE.Vector3(
          -(radius * Math.sin(phi) * Math.cos(theta)),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        ));
      } 
    });
  } 

  const borderMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 });
  const borderGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return new THREE.Line(borderGeometry, borderMaterial);
};
