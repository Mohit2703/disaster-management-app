import supabase from '../config/supabase.js';
import { io } from '../app.js';

export const createReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return res.status(400).json({ success: false, error: 'Report content is required' });
        }

        const { data, error } = await supabase
            .from('reports')
            .insert({
                disaster_id: id,
                user_id: userId,
                content
            })
            .select()
            .single();

        if (error) throw error;
        if (!data) {
            return res.status(404).json({ success: false, error: 'Disaster not found' });
        }
        
        // Emit report event to disaster room
        const io = req.app.get('io');
        io.to(`disaster_${id}`).emit('new_report', data);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create report'
        });
    }
}