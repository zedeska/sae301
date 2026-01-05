export function normalizeTflParking(tflData: any[]){
        const normalized = [];
        for(const place of tflData){
            if(place.lat && place.lon){
                normalized.push({id: place.id,
                type: place.type === undefined ? 'Parking' : place.type,
                lib: place.commonName,
                place_tot: null, // on a pas cette info et l'APi Occupancy ne fonctionne pas :c
                place_dispo: null,
                cout: null,
                coordinates: {
                    lattitude: place.lat,
                    longitude: place.lon
                },
                city: 'London'
                });
            }
        }
        return normalized;
    }