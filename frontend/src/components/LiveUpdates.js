import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // or your deployed backend

const LiveUpdates = () => {
    const [disasters, setDisasters] = useState([]);
    const [socialPosts, setSocialPosts] = useState([]);
    const [resources, setResources] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        socket.on('disaster_updated', (data) => {
            setDisasters(prev => [...prev, data]);
        });
        
        socket.on('social_media_updated', (data) => {
            setSocialPosts(prev => [...prev, ...data.posts]);
        });
        
        socket.on('resources_updated', (data) => {
            setResources(prev => [...prev, data]);
        });
        
        return () => {
            setTimeout(() => setLoading(false), 1000);
            socket.disconnect();
        };
    }, []);

    return (
        <div className="section full-width">
            <h2>Live Updates</h2>

            <h3>New Disasters</h3>
            {loading ? <div className="loader"></div> : (
                <>
                    <ul>
                        {disasters.map((d, i) => <li key={i}>{d.disaster?.title} — {d.action}</li>)}
                    </ul>
                </>
            )}

            <h3>Social Media</h3>
            {loading ? <div className="loader"></div> : (
                <>
                    <ul>
                        {socialPosts.map((p, i) => (
                            <li key={i} style={{ color: p.priority ? 'red' : 'black' }}>
                                {p.user}: {p.post}
                            </li>
                        ))}
                    </ul>
                </>
            )}

            <h3>Nearby Resources</h3>
            {loading ? <div className="loader"></div> : (
                <ul>
                    {resources.map((r, i) => (
                        <li key={i} className={r.priority ? 'priority' : ''}>
                            {r.user}: {r.post}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LiveUpdates;
