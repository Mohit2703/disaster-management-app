import supabase from '../config/supabase.js';
import { io } from '../app.js';
import { getLocationfromDescription } from '../utils/location.js';
import { gettLatLong } from '../utils/getGeocoding.js';

export const getDisasters = async (req, res) => {
    try {
    const { tag, owner_id, limit = 20, offset = 0 } = req.query;
    
    let query = supabase
      .from('disasters')
      .select(`
        *,
        reports(count),
        resources(count)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (tag) {
      query = query.contains('tags', [tag]);
    }
    
    if (owner_id) {
      query = query.eq('owner_id', owner_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: data?.length || 0
      }
    });
  } catch (error) {
    console.error('Get disasters error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch disasters'
    });
  }
}

export const createDisaster = async (req, res) => {

  try {
    const { title, description, location, tags } = req.body;
    console.log(req.user);
    const ownerId = req.user.id;
    
    if (!title || !description || !location) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const location_from_description = await getLocationfromDescription(description);
    
    console.log('Extracted Location:', location_from_description);
    
    const { latitude, longitude } = await gettLatLong(location);

    const { data, error } = await supabase
        .from('disasters')
        .insert({
          title,
          description,
          location_name: location,
          location: `POINT(${longitude} ${latitude})`,
          tags: tags || [],
          owner_id: ownerId
        })
        .select()
        .single();

    io.emit('disaster_updated', {
      action: 'create',
      disaster: data
    })
    // Join the disaster room for real-time updates
    io.to(`disaster_${data.id}`).emit('disaster_joined', {
      disasterId: data.id
    });

    if (error) throw error;

    res.json({
      success: true,
      data: data || {}
    });
  } catch (error) {
    console.error('Create disaster error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create disaster'
    });
  }
}

export const getDisasterById = async (req, res) => {
    
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
        .from('disasters')
        .select(`
            *,
            reports(count),
            resources(count)
        `)
        .eq('id', id)
        .single();
        
    if (error) throw error;
    if (!data) {
        return res.status(404).json({ success: false, error: 'Disaster not found' });
        }
    res.json({
        success: true,
        data: data || {}
    });
  } catch (error) {
    console.error('Get disaster error:', error);
    res.status(500).json({
        success: false,
        error: 'Failed to fetch disaster details'
        });
    }
}

export const updateDisaster = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, location, tags } = req.body;
        const ownerId = req.user.id;
        
        if (!title || !description || !location) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }
        // Geocode location to get coordinates
        const coordinates = {
            lat: 25.5941, // Example latitude
            lng: 85.1376  // Example longitude
        }
        
        const { data, error } = await supabase
            .from('disasters')
            .update({
                title,
                description,
                location_name: location,
                location:  `POINT(${coordinates.lng} ${coordinates.lat})`,
                tags: tags || []
            })
            .eq('id', id)
            .eq('owner_id', ownerId)
            .select()
            .single();
            
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Disaster not found or not authorized' });
        }

        io.emit('disaster_updated', {
            action: 'update',
            disaster: data
        });
        // Join the disaster room for real-time updates
        io.to(`disaster_${data.id}`).emit('disaster_joined', {
            disasterId: data.id
        });
        
        res.json({
            success: true,
            data: data || {}
        });
    } catch (error) {
        console.error('Update disaster error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update disaster'
        });
    }
}

export const deleteDisaster = async (req, res) => {
    
    try {
        const { id } = req.params;
        const ownerId = req.user.id;
        const { data, error } = await supabase
            .from('disasters')
            .delete()
            .eq('id', id)
            .eq('owner_id', ownerId)
            .select()
            .single();
            
        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Disaster not found or not authorized' });
        }

        // Emit disaster deletion event
        io.emit('disaster_updated', {
            action: 'delete',
            disasterId: id
        });
        // Leave the disaster room
        io.to(`disaster_${id}`).emit('disaster_left', {
            disasterId: id
        });
        
        res.json({
            success: true,
            message: 'Disaster deleted successfully'
        });
    } catch (error) {
        console.error('Delete disaster error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete disaster'
        });
    }
}
