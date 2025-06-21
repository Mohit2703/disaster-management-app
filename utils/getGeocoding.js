import axios from 'axios';

export const gettLatLong = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    try {
        const response = await axios.get(url);
        if (response.data && response.data.length > 0) {
            const { lat, lon } = response.data[0];
            return { lat: parseFloat(lat), lon: parseFloat(lon) };
        } else {
            throw new Error('No results found for the given address');
        }
    } catch (error) {
        console.error('Error fetching geocoding data:', error);
        throw error;
    }
}

