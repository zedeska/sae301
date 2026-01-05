export function normalizeParisParking(parisData: any[]){
        const normalized = [];
        for(const place of parisData){
            if(place.geo_point_2d){
                normalized.push({
                    id: place.id,
                    type: place.type_ouvrage === "ouvrage" ? "Parking" : place.type_ouvrage,
                    lib: place.nom,
                    place_tot: place.nb_places, 
                    place_dispo: null,
                    cout: place.tarif_1h ? `${place.tarif_1h}€/h` : null,
                    coordinates: {
                        lattitude: place.geo_point_2d.lat,
                        longitude: place.geo_point_2d.lon
                    },
                    city: 'Paris'
                });
            }
        }
        return normalized;
    }