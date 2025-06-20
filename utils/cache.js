const supabase = require('../config/supabase');

class Cache {
  static async get(key) {
    try {
      const { data, error } = await supabase
        .from('cache')
        .select('value')
        .eq('key', key)
        .gt('expires_at', new Date().toISOString())
        .single();
      
      if (error || !data) return null;
      return data.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  static async set(key, value, ttlHours = 1) {
    try {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);
      
      await supabase
        .from('cache')
        .upsert({
          key,
          value,
          expires_at: expiresAt.toISOString()
        });
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  static async cleanup() {
    try {
      await supabase
        .from('cache')
        .delete()
        .lt('expires_at', new Date().toISOString());
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }
}

module.exports = Cache;