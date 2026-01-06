import * as maptilersdk from '@maptiler/sdk';
import Routing from './routing';
import { routingState } from './stores/routingStore';

class Map {
    map: maptilersdk.Map = {} as maptilersdk.Map;
    private API_KEY: string = '1nbw0HVdWw3MdIEhMg9Z';
    private GH_API_KEY: string = 'bf6b9543-329f-4e71-b34e-8e1564b47d95'; // Replace with your actual GraphHopper API key
    private routing: Routing;
    longitude: number = 0;
    latitude: number = 0;
    containerId: string = '';
    markers: maptilersdk.Marker[] = [];

    constructor(containerId: string) {
        this.containerId = containerId;
        maptilersdk.config.apiKey = this.API_KEY;
        this.routing = new Routing(this.GH_API_KEY);
    }

    loadMap() {
        this.map = new maptilersdk.Map({
            container: this.containerId, // container's id or the HTML element to render the map
            style: maptilersdk.MapStyle.STREETS,
            geolocateControl: false,
            zoom: 14,
            center: [this.longitude, this.latitude]
        });

        this.map.on('load', () => {
            this.map.addSource('route', {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'properties': {},
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': []
                    }
                }
            });

            this.map.addLayer({
                'id': 'route',
                'type': 'line',
                'source': 'route',
                'layout': {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                'paint': {
                    'line-color': '#27aed4ff',
                    'line-width': 5
                }
            });

            this.map.addSource('point', {
                    'type': 'geojson',
                    'data': {
                        'type': 'Point',
                        'coordinates': [this.longitude, this.latitude]
                    }
                });

            this.map.addLayer({
                'id': 'point',
                'source': 'point',
                'type': 'circle',
                'paint': {
                    'circle-radius': 6,
                    'circle-color': '#007cbf'
                }
            });
        });
    }

    setPosition(latitude: number, longitude: number) {
        if (this.map.loaded()) {
            this.latitude = latitude;
            this.longitude = longitude;
            //this.map.setCenter([this.longitude, this.latitude]);
            const source: maptilersdk.GeoJSONSource = this.map.getSource('point') as maptilersdk.GeoJSONSource;
            source.setData({
                'type': 'Point',
                'coordinates': [this.longitude, this.latitude]
            });
        } else {
            setTimeout(() => {
                this.setPosition(latitude, longitude);
            }, 100);
        }
    }

    setLongitudeLatitude(longitude: number, latitude: number) {
        this.longitude = longitude;
        this.latitude = latitude;
    }

    setParkingMarkers(parkings: any[]) {
        this.markers = parkings.map(parking => {
            const div = document.createElement('div');
            div.innerHTML = `
                <h3>${parking.lib} - ${parking.type}</h3>
                <p>Places disponibles: ${parking.place_dispo !== null ? `${parking.place_dispo}/${parking.place_tot}` : `?/${parking.place_tot}`}</p>
                <p>Coût: ${parking.cout !== null ? parking.cout : 'Inconnu'}</p>
            `;
            const btn = document.createElement('button');
            btn.innerText = 'Y aller';
            btn.style.marginTop = '8px';
            btn.style.backgroundColor = '#27aed4ff';
            btn.style.color = 'white';
            btn.style.border = 'none';
            btn.style.padding = '8px 12px';
            btn.style.borderRadius = '4px';
            btn.style.cursor = 'pointer';
            btn.onclick = () => {
                this.drawRoute(parking.coordinates.longitude, parking.coordinates.lattitude, parking.lib);
                popup.remove();
            };
            div.appendChild(btn);

            const popup = new maptilersdk.Popup({ offset: 25 }).setDOMContent(div);
            return new maptilersdk.Marker()
            .setLngLat([parking.coordinates.longitude, parking.coordinates.lattitude])
            .setPopup(popup)
            .addTo(this.map);
        });
    }

    clearParkingMarkers() {
        if (this.markers) {
            this.markers.forEach(marker => marker.remove());
        }
        this.markers = [];
    }

    clearRoute() {
        if (this.map && this.map.getSource && this.map.getSource('route')) {
            const source = this.map.getSource('route') as maptilersdk.GeoJSONSource;
            source.setData({
                'type': 'Feature',
                'properties': {},
                'geometry': {
                    'type': 'LineString',
                    'coordinates': []
                }
            });
        }
        // Reset the store
        routingState.set({
            isVisible: false,
            destination: '',
            LngLat: { lng: 0, lat: 0 }
        });
    }

    async drawRoute(destLng: number, destLat: number, destinationName: string = 'Destination') {
        if (this.longitude === 0 && this.latitude === 0) {
            console.error("User position not set");
            return;
        }

        // Check if the destination is in the current markers list
        const isKnownDestination = this.markers.some(marker => {
            const lngLat = marker.getLngLat();
            // Use a small epsilon for float comparison or exact match if data comes from same source
            return Math.abs(lngLat.lng - destLng) < 0.000001 && Math.abs(lngLat.lat - destLat) < 0.000001;
        });

        if (!isKnownDestination) {
            this.clearRoute();
            return;
        }

        // Wait for map to be loaded before trying to add source/layer
        if (!this.map.loaded()) {
            await new Promise<void>(resolve => {
                this.map.once('load', () => resolve());
            });
        }

        routingState.set({
            isVisible: true,
            destination: destinationName,
            LngLat: { lng: destLng, lat: destLat }
        });

        const geometry = await this.routing.getRoute(
            { lat: this.latitude, lng: this.longitude },
            { lat: destLat, lng: destLng }
        );

        if (geometry) {
            const geojson = {
                'type': 'Feature',
                'properties': {},
                'geometry': geometry
            };
            const source = this.map.getSource('route') as maptilersdk.GeoJSONSource;
            if (source) {
                source.setData(geojson as any);
            }
        }
    }
}

export default Map;