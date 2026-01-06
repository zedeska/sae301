export function normalizeTflParking(tflData: any[]) {
    const normalized = [];

    for (const place of tflData) {
        if (place.lat && place.lon) {
            const getValue = (key: string) => {
                if (!place.additionalProperties) return null;
                const prop = place.additionalProperties.find((p: any) => p.key === key);
                return prop ? prop.value : null;
            };
            const totalSpacesStr = getValue('NumberOfSpaces');
            const dailyPrice = getValue('StandardTariffsCashlessDaily') || getValue('StandardTariffsCashDaily');
            const disabledSpacesStr = getValue('NumberOfDisabledBays');
            const chargingPointsStr = getValue('CarElectricalChargingPoints');
            normalized.push({
                id: place.id,
                type: place.placeType || 'Parking',
                lib: place.commonName,
                place_tot: totalSpacesStr ? parseInt(totalSpacesStr, 10) : null,
                place_dispo: null,
                cout: dailyPrice ? `Daily: £${dailyPrice}` : null,
                pmr: disabledSpacesStr ? parseInt(disabledSpacesStr, 10) : 0,
                borne_recharge: chargingPointsStr === 'False' ? 0 : chargingPointsStr,
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