import supabase from '../config/supabase.js';
import { io } from '../app.js';
import { gettLatLong } from '../utils/getGeocoding.js';

export const createResource = async (req, res) => {
    try {
        const { id } = req.params;
        let { type, description, link, location, lat, lon } = req.body;
        const userId = req.user.id;
        
        if (!type || !description || !link) {
            return res.status(400).json({ success: false, error: 'Resource type, description and link are required' });
        }

        // Validate disaster exists
        if (!lat || !lon) {
            if (!location) {
                return res.status(400).json({ success: false, error: 'lat, lon or location is required' });
            }
            // If location is provided, we can use geocoding to get lat and lon
            const { latitude, longitude } = await gettLatLong(location);
            if (!latitude || !longitude) {
                return res.status(400).json({ success: false, error: 'Invalid location' });
            }
            lat = latitude;
            lon = longitude;
        }

        const { data, error } = await supabase
            .from('resources')
            .insert({
                disaster_id: id,
                user_id: userId,
                type,
                description,
                location_name: location,
                location: `POINT(${lon} ${lat})`,
                link
            })
            .select()
            .single();
            
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Disaster not found' });
        }
        
        // Emit resource event to disaster room

        io.to(`disaster_${id}`).emit('new_resource', data);
        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create resource'
        });
    }
}

export const getResourcesByDisasterId = async (req, res) => {
    const { id } = req.params;
    let { lat, lon, location } = req.query;

    if (!lat || !lon) {
        if (!location) {
            return res.status(400).json({ error: 'lat, lon or location is required' });
        }
        // If location is provided, we can use geocoding to get lat and lon
        const locationDetail = await gettLatLong(location);
        const latitude = locationDetail.lat;
        const longitude = locationDetail.lon;
        console.log('Geocoded location:', latitude, longitude);
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Invalid location' });
        }
        lat = latitude;
        lon = longitude;
    }

    const radiusInMeters = 10000; // 10 km

    const { data, error } = await supabase.rpc('get_nearby_resources', {
    lat_input: parseFloat(lat),
    lon_input: parseFloat(lon),
    radius: radiusInMeters
    });

    if (error) {
    console.error('Error fetching nearby resources:', error);
    return res.status(500).json({ error: 'Internal server error' });
    }

    return res.json({
    disasterId: id,
    nearbyResources: data,
    });
}

