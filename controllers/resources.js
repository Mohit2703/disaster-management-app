import supabase from '../config/supabase.js';
import { io } from '../app.js';

export const createResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, description, link } = req.body;
        const userId = req.user.id;
        
        if (!type || !description || !link) {
            return res.status(400).json({ success: false, error: 'Resource type, description and link are required' });
        }
        const { data, error } = await supabase
            .from('resources')
            .insert({
                disaster_id: id,
                user_id: userId,
                type,
                description,
                link
            })
            .select()
            .single();
            
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Disaster not found' });
        }
        
        // Emit resource event to disaster room
        const io = req.app.get('io');
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
    const { lat, lon } = req.query;

    if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
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

