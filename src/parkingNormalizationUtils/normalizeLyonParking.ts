export function normalizeLyonParking(lyonData: any[]){
        const normalized = [];
        for(const feature of lyonData){
            const props = feature.properties; 
            const geom = feature.geometry;   
            if(geom && geom.coordinates){
                if (props.etat = "ouvert"){
                    normalized.push({
                    id: props.gid,
                    type: props.type_ouvrage === "ouvrage" ? "Parking" : (props.type_ouvrage || "Parking"),
                    lib: props.nom,
                    place_tot: props.nb_places, 
                    place_dispo: props.places_disponibles,
                    cout: props.tarif_1h ? `${props.tarif_1h}€/1h` : null,
                    pmr: props.nb_pmr,
                    borne_recharge: props.nb_voitures_electriques,
                    coordinates: {
                        lattitude: geom.coordinates[1], 
                        longitude: geom.coordinates[0]
                    },
                    city: 'Lyon'
                });0
                }
                
            }
        }
        return normalized;
    }