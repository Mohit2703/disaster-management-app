import React, { useState } from 'react';
import axios from 'axios';

const DisasterForm = () => {
  const [title, setTitle] = useState('');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await axios.post('/disasters', {
      title,
      location_name: locationName,
      description,
      tags: tags.split(',').map(t => t.trim()),
    });
    setLoading(false);
    alert('Disaster created');
  };

  return (
    <div className="section full-width">
    <form onSubmit={handleSubmit}>
      <h2>Create Disaster</h2>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" /><br />
      <input value={locationName} onChange={e => setLocationName(e.target.value)} placeholder="Location Name" /><br />
      <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" /><br />
      <input value={tags} onChange={e => setTags(e.target.value)} placeholder="Tags (comma-separated)" /><br />
    <button disabled={loading}>
        {loading ? 'Submitting...' : 'Submit'}
    </button>
    </form>
    </div>
  );
};

export default DisasterForm;
