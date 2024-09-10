"use client"
import React, { useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Popup } from 'maplibre-gl';

const MapPage = () => {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/streets/style.json?key=a4599qTTEFBtLIUzRYy3',
      center: [-92.453400, 42.537811],
      zoom: 9
    });

    map.on('load', function() {
      const marker = new maplibregl.Marker()
        .setLngLat([-92.453400, 42.537811])
        .addTo(map);

      const popup = new Popup({
        closeButton: false,
        closeOnClick: false
      });

      marker.getElement().addEventListener('mouseenter', () => {
        popup.setLngLat(marker.getLngLat())
          .setHTML('<div style={{ color: "black" }}><h3>Hello World!</h3><p>This is a popup with text content.</p></div>')
          .addTo(map);
      });

      marker.getElement().addEventListener('mouseleave', () => {
        popup.remove();
      });
    });
  }, []);

  return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
};

export default MapPage;
