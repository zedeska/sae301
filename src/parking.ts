import { LngLat } from "@maptiler/sdk";
import { normalizeLyonParking } from "./parkingNormalizationUtils/normalizeLyonParking";
import { normalizeParisParking} from "./parkingNormalizationUtils/normalizeParisParking"
import { normalizeTflParking } from "./parkingNormalizationUtils/normalizeTflParking";
export class Parking {
    parkingsDsp : any[] = [];
    parkings : any[] = [];
    private readonly TFL_API_KEY = "06dcde4d1865490d943d578017cd8518"; // Clé récupérer suite à inscription
// prefence : [0] gratuit seulement , [1] pmr seulement, [2] borne de recharge seulement
    getParkingPreference(parkings : any[], position: LngLat, preference: number[]){
        if(preference[0] === 1){
            parkings = parkings.filter(parking => {
                return parking.payant === false;
            });
        }
        if(preference[1] === 1){
            parkings = parkings.filter(parking => {
                return parking.pmr && parking.pmr > 0;
            });
        }
        if(preference[2] === 1){
            parkings = parkings.filter(parking => {
                return parking.borne_recharge && parking.borne_recharge > 0;
            }); 
        }       
        return parkings;
    }
    getNearParkings(position: LngLat, dspOnly: boolean, radius: number = 3000, preference = []) {
        let nearbyParkings = [];
        
        const dspParkings = this.parkingsDsp.filter(parking => {
            const parkingPos = new LngLat(parking.coordinates.longitude, parking.coordinates.lattitude);
            const distance = position.distanceTo(parkingPos);
            return distance <= radius;
        });
        nearbyParkings.push(...dspParkings);

        if (!dspOnly) {
            const otherParkings = this.parkings.filter(parking => {
                const parkingPos = new LngLat(parking.coordinates.longitude, parking.coordinates.lattitude);
                const distance = position.distanceTo(parkingPos);
                return distance <= radius;
            });
            nearbyParkings.push(...otherParkings);
        }
        nearbyParkings = this.getParkingPreference(nearbyParkings, position, preference);
        return nearbyParkings;
    }

    getNearestParking(position: LngLat) {
        let nearestParking = null;
        let minDistance = Infinity;

        const allParkings = [...this.parkingsDsp, ...this.parkings]; 

        for (let parking of allParkings) {
            const parkingPos = new LngLat(parking.coordinates.longitude, parking.coordinates.lattitude);
            const distance = position.distanceTo(parkingPos);
            if (distance < minDistance) {
                minDistance = distance;
                nearestParking = parking;
            }
        }
        return nearestParking;
    }
    // metz seulement + sert de base pour les autres villes
    async fetchParkings() {
        this.parkings = [];
        this.parkingsDsp = [];
        try {
            const metzResponse = await fetch('https://maps.eurometropolemetz.eu/public/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=public:pub_tsp_sta&srsName=EPSG:4326&outputFormat=application%2Fjson&cql_lter=id%20is%20not%20null');
            const metzData = await metzResponse.json();

            for(let feature of metzData.features){
                const parkingData = {
                    id: feature.id,
                    type: feature.properties.typ,
                    lib: feature.properties.lib,
                    place_tot: feature.properties.place_total,
                    place_dispo: feature.properties.place_libre,
                    payant: feature.properties.cout === null ? false : true,
                    cout: feature.properties.cout,
                    coordinates: {
                        lattitude: feature.geometry.coordinates[1],
                        longitude: feature.geometry.coordinates[0]
                    },
                    city: 'Metz'
                };
                if(parkingData.place_dispo !== null && parkingData.place_tot !== null){
                    this.parkingsDsp.push(parkingData);
                } else{
                    this.parkings.push(parkingData);
                }
            }
        } catch (e) {
            console.error('Failed to fetch Metz parkings: ', e);
        }

        try {
            const tflUrl = `https://api.tfl.gov.uk/Place/Type/CarPark?app_key=${this.TFL_API_KEY}`;
            const tflResponse = await fetch(tflUrl);

            if(!tflResponse.ok){
                console.error(`TFL Location API request failed with status ${tflResponse.status}`);
            }
            else { 
                const tflData = await tflResponse.json();
                const normalizedTflParkings = normalizeTflParking(tflData);
                // On les mettra dans parkingsDsp tant que l'API Occupancy ne fonctionne pas
                this.parkingsDsp.push(...normalizedTflParkings) // décomposer et fusionner  (https://www.geeksforgeeks.org/typescript/how-to-use-spread-operator-in-typescript/)
            }
        } catch(e){
            console.error('Failed to fetch TFL parkings: ', e);
        }
        try {
            const parisUrl = 'https://opendata.paris.fr/api/explore/v2.1/catalog/datasets/stationnement-en-ouvrage/records?limit=100';
            const parisResponse = await fetch(parisUrl);
            
            if(!parisResponse.ok) {
                console.error(`Paris OpenData API request failed with status ${parisResponse.status}`);
            } else {
                const parisDataJson = await parisResponse.json();
                if(parisDataJson.results) {
                    const normalizedParisParkings = normalizeParisParking(parisDataJson.results);
                    // Ne donne pas le nombre de place dispo donc on mets de base
                    this.parkingsDsp.push(...normalizedParisParkings);
                }
            }
        } catch(e) {
            console.error('Failed to fetch Paris parkings: ', e);
        }
        try {
            const lyonUrl = 'https://data.grandlyon.com/fr/geoserv/ogc/features/v1/collections/metropole-de-lyon:parkings-de-la-metropole-de-lyon-disponibilites-temps-reel-v2/items?&f=application/geo%2Bjson&crs=EPSG:4171&startIndex=0&sortby=gid';
            
            const lyonResponse = await fetch(lyonUrl);
            
            if(!lyonResponse.ok) {
                console.error(`Lyon OpenData API request failed with status ${lyonResponse.status}`);
            } else {
                const lyonDataJson = await lyonResponse.json();
                if(lyonDataJson.features) {
                    const normalizedLyonParkings = normalizeLyonParking(lyonDataJson.features);
                    this.parkingsDsp.push(...normalizedLyonParkings);
                }
            }
        } catch(e) {
            console.error('Failed to fetch Lyon parkings: ', e);
        }
    }
}