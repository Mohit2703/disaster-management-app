import React, { useState, useEffect } from 'react';
import { AlertCircle, MapPin, MessageCircle, Shield, FileText, Plus, Search, Edit, Trash } from 'lucide-react';

const DisasterResponseUI = () => {
  const [activeTab, setActiveTab] = useState('disasters');
  const [disasters, setDisasters] = useState([]);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [socialMedia, setSocialMedia] = useState([]);
  const [resources, setResources] = useState([]);
  const [officialUpdates, setOfficialUpdates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // API Base URL - adjust this to your backend URL
  const API_BASE = 'http://localhost:5000/api';

  // Mock user for authentication
  const currentUser = 'netrunnerX';

  // Form states
  const [disasterForm, setDisasterForm] = useState({
    title: '',
    location_name: '',
    description: '',
    tags: ''
  });

  const [reportForm, setReportForm] = useState({
    content: '',
    image_url: ''
  });

  const [geocodeForm, setGeocodeForm] = useState({
    description: ''
  });

  const [verifyImageForm, setVerifyImageForm] = useState({
    image_url: ''
  });

  const [resourceQuery, setResourceQuery] = useState({
    lat: '',
    lon: '',
    location: ''
  });

  // Styles
  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '16px'
    },
    maxWidth: {
      maxWidth: '1280px',
      margin: '0 auto'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '24px',
      marginBottom: '24px'
    },
    header: {
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#111827',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    },
    subtext: {
      color: '#6b7280',
      marginTop: '8px'
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '6px'
    },
    messageSuccess: {
      backgroundColor: '#dcfce7',
      color: '#166534'
    },
    messageError: {
      backgroundColor: '#fef2f2',
      color: '#dc2626'
    },
    loading: {
      marginTop: '8px',
      color: '#2563eb'
    },
    tabContainer: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      marginBottom: '24px'
    },
    tabList: {
      display: 'flex',
      borderBottom: '1px solid #e5e7eb'
    },
    tab: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      backgroundColor: 'transparent'
    },
    tabActive: {
      color: '#2563eb',
      borderBottom: '2px solid #2563eb'
    },
    tabInactive: {
      color: '#6b7280'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '24px'
    },
    gridLg: {
      '@media (min-width: 1024px)': {
        gridTemplateColumns: '2fr 1fr'
      }
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '16px',
      minHeight: '96px',
      resize: 'vertical'
    },
    button: {
      padding: '12px 24px',
      borderRadius: '6px',
      border: 'none',
      fontWeight: '500',
      cursor: 'pointer',
      fontSize: '16px'
    },
    buttonPrimary: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    buttonSecondary: {
      backgroundColor: '#6b7280',
      color: 'white'
    },
    buttonDanger: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    buttonSuccess: {
      backgroundColor: '#16a34a',
      color: 'white'
    },
    buttonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '16px'
    },
    disasterCard: {
      padding: '16px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      cursor: 'pointer',
      marginBottom: '16px'
    },
    disasterCardSelected: {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff'
    },
    tag: {
      backgroundColor: '#e5e7eb',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '14px',
      display: 'inline-block',
      marginRight: '8px',
      marginTop: '8px'
    },
    alertBox: {
      padding: '12px',
      backgroundColor: '#eff6ff',
      borderRadius: '6px',
      marginBottom: '16px'
    },
    codeBlock: {
      backgroundColor: '#f3f4f6',
      padding: '2px 6px',
      borderRadius: '4px',
      fontFamily: 'monospace',
      fontSize: '14px'
    },
    methodBadge: {
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '12px',
      fontWeight: '600',
      marginRight: '8px'
    }
  };

  // Utility function for API calls
  const apiCall = async (endpoint, options = {}) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser,
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setMessage(`✓ Success: ${endpoint}`);
      return data;
    } catch (error) {
      setMessage(`✗ Error: ${error.message}`);
      console.error('API Error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Load disasters on component mount
  useEffect(() => {
    loadDisasters();
  }, []);

  const loadDisasters = async () => {
    const data = await apiCall('/disasters');
    if (data) setDisasters(data.data || []);
  };

  const createDisaster = async () => {
    if (!disasterForm.title || !disasterForm.location_name || !disasterForm.description) {
      setMessage('✗ Error: Please fill in all required fields');
      return;
    }
    const tags = disasterForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    const data = await apiCall('/disasters', {
      method: 'POST',
      body: JSON.stringify({
        ...disasterForm,
        tags,
        owner_id: currentUser
      })
    });
    if (data) {
      setDisasterForm({ title: '', location_name: '', description: '', tags: '' });
      loadDisasters();
    }
  };

  const deleteDisaster = async (id) => {
    if (window.confirm('Are you sure you want to delete this disaster?')) {
      await apiCall(`/disasters/${id}`, { method: 'DELETE' });
      loadDisasters();
      if (selectedDisaster?.id === id) {
        setSelectedDisaster(null);
      }
    }
  };

  const loadSocialMedia = async (disasterId) => {
    const data = await apiCall(`/disasters/${disasterId}/social-media`);
    console.log("Response", data.results);
    if (data) setSocialMedia(data.results || []);
  };

  const loadResources = async (disasterId, lat, lon, location) => {
    let endpoint = `/disasters/${disasterId}/resources`;
    if (lat && lon) {
      endpoint += `?lat=${lat}&lon=${lon}`;
    } else if (location) {
      endpoint += `?location=${encodeURIComponent(location)}`;
    }
    const data = await apiCall(endpoint);
    console.log("Resources data:", data);
    if (data) setResources(data.nearbyResources || []);
  };

  const loadOfficialUpdates = async (disasterId) => {
    let data = await apiCall(`/disasters/${disasterId}/official-updates`);
    data = data.updates
    console.log("Official updates data:", data);
    const offUpdates = [];
    if (data.redCross) {
      for (const update of data.redCross) {
        offUpdates.push({
          title: 'Red Cross Update',
          content: update,
          source: 'Red Cross'
        });
      }
    }
    if (data.fema) {
      for (const update of data.fema) {
        offUpdates.push({
          title: 'FEMA Update',
          content: update,
          source: 'FEMA'
        });
      }
    }
    if (data.nationalGuard) {
      for (const update of data.nationalGuard) {
        offUpdates.push({
          title: 'National Guard Update',
          content: update,
          source: 'National Guard'
        });
      }
    }
    if (data.relief) {
      for (const update of data.relief) {
        offUpdates.push({
          title: 'Relief Organization Update',
          content: update,
          source: 'Relief Organization'
        });
      }
    }
    console.log("Official updates:", offUpdates);
    if (data) setOfficialUpdates(offUpdates || []);
  };

  const geocodeLocation = async () => {
    if (!geocodeForm.description) {
      setMessage('✗ Error: Please enter a description');
      return;
    }
    const data = await apiCall('/geocode', {
      method: 'POST',
      body: JSON.stringify({ description: geocodeForm.description })
    });
    if (data) {
      setMessage(`✓ Geocoded: ${data.location_name} -> (${data.lat}, ${data.lng})`);
    }
  };

  const verifyImage = async () => {
    if (!selectedDisaster) {
      setMessage('✗ Please select a disaster first');
      return;
    }
    if (!verifyImageForm.image_url) {
      setMessage('✗ Error: Please enter an image URL');
      return;
    }
    const data = await apiCall(`/disasters/${selectedDisaster.id}/verify-image`, {
      method: 'POST',
      body: JSON.stringify({ imageUrl: verifyImageForm.image_url })
    });
    console.log("Image verification data:", data.data);
    if (data.data) {
      setMessage(`✓ Image verification: ${data.data}`);
    }
  };

  const submitReport = async () => {
    if (!selectedDisaster) {
      setMessage('✗ Please select a disaster first');
      return;
    }
    if (!reportForm.content) {
      setMessage('✗ Error: Please enter report content');
      return;
    }
    // This would typically be a separate endpoint, but we'll simulate it
    setMessage('✓ Report submitted (simulated)');
    setReportForm({ content: '', image_url: '' });
  };

  const getMethodBadgeStyle = (method) => {
    const baseStyle = { ...styles.methodBadge };
    switch (method) {
      case 'GET':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'POST':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#1d4ed8' };
      case 'PUT':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#d97706' };
      case 'DEL':
        return { ...baseStyle, backgroundColor: '#fecaca', color: '#dc2626' };
      default:
        return baseStyle;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.maxWidth}>
        {/* Header */}
        <div style={styles.card}>
          <h1 style={styles.header}>
            <AlertCircle color="#ef4444" />
            Disaster Response Platform
          </h1>
          <p style={styles.subtext}>Current User: {currentUser}</p>
          {message && (
            <div style={{
              ...styles.message,
              ...(message.startsWith('✓') ? styles.messageSuccess : styles.messageError)
            }}>
              {message}
            </div>
          )}
          {loading && (
            <div style={styles.loading}>Loading...</div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div style={styles.tabContainer}>
          <div style={styles.tabList}>
            {[
              { id: 'disasters', label: 'Disasters', icon: AlertCircle },
              { id: 'geocoding', label: 'Geocoding', icon: MapPin },
              { id: 'social', label: 'Social Media', icon: MessageCircle },
              { id: 'resources', label: 'Resources', icon: Shield },
              { id: 'updates', label: 'Official Updates', icon: FileText },
              { id: 'verify', label: 'Image Verification', icon: Search }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  ...styles.tab,
                  ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive)
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{...styles.grid, gridTemplateColumns: window.innerWidth >= 1024 ? '2fr 1fr' : '1fr'}}>
          {/* Main Content */}
          <div>
            {activeTab === 'disasters' && (
              <div style={styles.card}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Plus size={20} />
                  Create Disaster
                </h2>
                <div style={styles.formGroup}>
                  <input
                    type="text"
                    placeholder="Disaster Title"
                    value={disasterForm.title}
                    onChange={(e) => setDisasterForm({...disasterForm, title: e.target.value})}
                    style={styles.input}
                  />
                  <input
                    type="text"
                    placeholder="Location Name (e.g., Manhattan, NYC)"
                    value={disasterForm.location_name}
                    onChange={(e) => setDisasterForm({...disasterForm, location_name: e.target.value})}
                    style={styles.input}
                  />
                  <textarea
                    placeholder="Description"
                    value={disasterForm.description}
                    onChange={(e) => setDisasterForm({...disasterForm, description: e.target.value})}
                    style={styles.textarea}
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma-separated: flood, urgent)"
                    value={disasterForm.tags}
                    onChange={(e) => setDisasterForm({...disasterForm, tags: e.target.value})}
                    style={styles.input}
                  />
                  <button
                    onClick={createDisaster}
                    disabled={loading}
                    style={{
                      ...styles.button,
                      ...styles.buttonPrimary,
                      ...(loading ? styles.buttonDisabled : {})
                    }}
                  >
                    Create Disaster
                  </button>
                </div>

                <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Active Disasters</h3>
                <div>
                  {disasters.map(disaster => (
                    <div
                      key={disaster.id}
                      onClick={() => setSelectedDisaster(disaster)}
                      style={{
                        ...styles.disasterCard,
                        ...(selectedDisaster?.id === disaster.id ? styles.disasterCardSelected : {})
                      }}
                    >
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <div style={{flex: 1}}>
                          <h4 style={{fontWeight: '600', fontSize: '18px', marginBottom: '4px'}}>{disaster.title}</h4>
                          <p style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px'}}>
                            <MapPin size={16} />
                            {disaster.location_name}
                          </p>
                          <p style={{color: '#374151', marginBottom: '8px'}}>{disaster.description}</p>
                          {disaster.tags && (
                            <div>
                              {disaster.tags.map(tag => (
                                <span key={tag} style={styles.tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDisaster(disaster.id);
                          }}
                          style={{
                            ...styles.button,
                            ...styles.buttonDanger,
                            padding: '4px'
                          }}
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'geocoding' && (
              <div style={styles.card}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <MapPin size={20} />
                  Location Geocoding
                </h2>
                <div style={styles.formGroup}>
                  <textarea
                    placeholder="Enter description containing location (e.g., 'Heavy flooding reported in downtown Manhattan near Times Square')"
                    value={geocodeForm.description}
                    onChange={(e) => setGeocodeForm({...geocodeForm, description: e.target.value})}
                    style={styles.textarea}
                  />
                  <button
                    onClick={geocodeLocation}
                    disabled={loading}
                    style={{
                      ...styles.button,
                      ...styles.buttonSuccess,
                      ...(loading ? styles.buttonDisabled : {})
                    }}
                  >
                    Extract & Geocode Location
                  </button>
                </div>
                <div style={{fontSize: '14px', color: '#6b7280'}}>
                  This will use Gemini API to extract location names and convert them to coordinates.
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div style={styles.card}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <MessageCircle size={20} />
                  Social Media Reports
                </h2>
                {selectedDisaster ? (
                  <div>
                    <div style={styles.alertBox}>
                      <strong>Selected Disaster:</strong> {selectedDisaster.title}
                    </div>
                    <button
                      onClick={() => loadSocialMedia(selectedDisaster.id)}
                      disabled={loading}
                      style={{
                        ...styles.button,
                        backgroundColor: '#7c3aed',
                        color: 'white',
                        marginBottom: '16px',
                        ...(loading ? styles.buttonDisabled : {})
                      }}
                    >
                      Load Social Media Reports
                    </button>
                    <div>
                      {socialMedia.map((post, index) => (
                        <div key={index} style={{...styles.disasterCard, cursor: 'default'}}>
                          <div style={{fontWeight: '500', fontSize: '14px', color: '#6b7280', marginBottom: '4px'}}>@{post.user}</div>
                          <div>{post.post}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#6b7280'}}>Select a disaster first to view social media reports.</div>
                )}
              </div>
            )}

            {activeTab === 'resources' && (
              <div style={styles.card}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Shield size={20} />
                  Nearby Resources
                </h2>
                {selectedDisaster ? (
                  <div>
                    <div style={styles.alertBox}>
                      <strong>Selected Disaster:</strong> {selectedDisaster.title}
                    </div>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px'}}>
                      <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={resourceQuery.lat}
                        onChange={(e) => setResourceQuery({...resourceQuery, lat: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={resourceQuery.lon}
                        onChange={(e) => setResourceQuery({...resourceQuery, lon: e.target.value})}
                        style={styles.input}
                      />
                      <input
                        type="text"
                        placeholder="Location Name (e.g., Manhattan, NYC)"
                        value={resourceQuery.location}
                        onChange={(e) => setResourceQuery({...resourceQuery, location: e.target.value})}
                        style={styles.input}
                      />
                    </div>
                    <button
                      onClick={() => loadResources(selectedDisaster.id, resourceQuery.lat, resourceQuery.lon, resourceQuery.location)}
                      disabled={loading}
                      style={{
                        ...styles.button,
                        backgroundColor: '#ea580c',
                        color: 'white',
                        marginBottom: '16px',
                        ...(loading ? styles.buttonDisabled : {})
                      }}
                    >
                      Find Nearby Resources
                    </button>
                    <div>
                      {resources.map((resource, index) => (
                        <div key={index} style={{...styles.disasterCard, cursor: 'default'}}>
                          <div style={{fontWeight: '600', marginBottom: '4px'}}>{resource.name}</div>
                          <div style={{color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px'}}>
                            <MapPin size={14} />
                            {resource.location_name}
                          </div>
                          <div style={{fontSize: '14px', color: '#6b7280'}}>Type: {resource.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#6b7280'}}>Select a disaster first to view resources.</div>
                )}
              </div>
            )}

            {activeTab === 'updates' && (
              <div style={styles.card}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <FileText size={20} />
                  Official Updates
                </h2>
                {selectedDisaster ? (
                  <div>
                    <div style={styles.alertBox}>
                      <strong>Selected Disaster:</strong> {selectedDisaster.title}
                    </div>
                    <button
                      onClick={() => loadOfficialUpdates(selectedDisaster.id)}
                      disabled={loading}
                      style={{
                        ...styles.button,
                        backgroundColor: '#4f46e5',
                        color: 'white',
                        marginBottom: '16px',
                        ...(loading ? styles.buttonDisabled : {})
                      }}
                    >
                      Load Official Updates
                    </button>
                    <div>
                      {officialUpdates.map((update, index) => (
                        <div key={index} style={{...styles.disasterCard, cursor: 'default'}}>
                          <div style={{fontWeight: '600', marginBottom: '4px'}}>{update.title}</div>
                          <div style={{color: '#374151', marginBottom: '8px'}}>{update.content}</div>
                          <div style={{fontSize: '12px', color: '#6b7280'}}>Source: {update.source}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{color: '#6b7280'}}>Select a disaster first to view official updates.</div>
                )}
              </div>
            )}

            {activeTab === 'verify' && (
              <div style={styles.card}>
                <h2 style={{fontSize: '20px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <Search size={20} />
                  Image Verification
                </h2>
                <div style={styles.formGroup}>
                  <input
                    type="url"
                    placeholder="Image URL to verify"
                    value={verifyImageForm.image_url}
                    onChange={(e) => setVerifyImageForm({...verifyImageForm, image_url: e.target.value})}
                    style={styles.input}
                  />
                  <button
                    onClick={verifyImage}
                    disabled={loading || !selectedDisaster}
                    style={{
                      ...styles.button,
                      ...styles.buttonDanger,
                      ...(loading || !selectedDisaster ? styles.buttonDisabled : {})
                    }}
                  >
                    Verify Image Authenticity
                  </button>
                </div>
                {!selectedDisaster && (
                  <div style={{color: '#6b7280'}}>Select a disaster first to verify images.</div>
                )}
                <div style={{fontSize: '14px', color: '#6b7280'}}>
                  This will use Gemini API to analyze the image for authenticity and disaster context.
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div style={styles.card}>
              <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Submit Report</h3>
              <div style={styles.formGroup}>
                <textarea
                  placeholder="Report content"
                  value={reportForm.content}
                  onChange={(e) => setReportForm({...reportForm, content: e.target.value})}
                  style={{...styles.textarea, minHeight: '80px'}}
                />
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  value={reportForm.image_url}
                  onChange={(e) => setReportForm({...reportForm, image_url: e.target.value})}
                  style={styles.input}
                />
                <button
                  onClick={submitReport}
                  disabled={loading || !selectedDisaster}
                  style={{
                    ...styles.button,
                    ...styles.buttonSuccess,
                    ...(loading || !selectedDisaster ? styles.buttonDisabled : {})
                  }}
                >
                  Submit Report
                </button>
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>API Endpoints</h3>
              <div style={{fontSize: '14px'}}>
                {[
                  { method: 'GET', endpoint: '/disasters' },
                  { method: 'POST', endpoint: '/disasters' },
                  { method: 'PUT', endpoint: '/disasters/:id' },
                  { method: 'DEL', endpoint: '/disasters/:id' },
                  { method: 'GET', endpoint: '/disasters/:id/social-media' },
                  { method: 'GET', endpoint: '/disasters/:id/resources' },
                  { method: 'POST', endpoint: '/geocode' },
                  { method: 'POST', endpoint: '/disasters/:id/verify-image' }
                ].map((api, index) => (
                  <div key={index} style={{display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center'}}>
                    <span style={getMethodBadgeStyle(api.method)}>{api.method}</span>
                    <span style={styles.codeBlock}>{api.endpoint}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={{fontSize: '18px', fontWeight: '600', marginBottom: '16px'}}>Mock Data</h3>
              <div style={{fontSize: '14px', color: '#6b7280'}}>
                <p style={{marginBottom: '8px'}}><strong>Sample Location:</strong> Manhattan, NYC</p>
                <p style={{marginBottom: '8px'}}><strong>Sample Tags:</strong> flood, urgent, earthquake</p>
                <p style={{marginBottom: '8px'}}><strong>Current User:</strong> {currentUser}</p>
                <p><strong>Mock User:</strong> reliefAdmin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisasterResponseUI;