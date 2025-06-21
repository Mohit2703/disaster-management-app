import React, { useState } from 'react';
import axios from 'axios';


const ReportForm = () => {
  const [disasterId, setDisasterId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [reportId, setReportId] = useState('');
    const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    const res = await axios.post(`/disasters/${disasterId}/verify-image`, {
      image_url: imageUrl,
      report_id: reportId
    });
    alert(`Verdict: ${res.data.verdict}`);
    setLoading(false);
  };

  return (
    <div className="section full-width">
      <h2>Verify Image</h2>
      <input value={disasterId} onChange={e => setDisasterId(e.target.value)} placeholder="Disaster ID" /><br />
      <input value={reportId} onChange={e => setReportId(e.target.value)} placeholder="Report ID" /><br />
      <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL" /><br />
      {/* <button onClick={handleVerify}>Verify</button> */}
      <button onClick={handleVerify} disabled={loading}>
        {loading ? 'Verifying...' : 'Verify'}
      </button>
    </div>
  );
};

export default ReportForm;
