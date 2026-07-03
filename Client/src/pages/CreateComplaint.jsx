import React, { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    complaintType: 'Public',
    locationType: 'Hostel',
    locationName: 'BH1',
    floor: 'Ground Floor',
    roomNumber: '',
    category: 'Electricity',
    priority: 'Low',
    title: '',
    description: '',
    additionalInstruction: '',
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dynamic values based on selections
  const hostels = ['BH1', 'BH2', 'BH3', 'BH4', 'BH5', 'GH1', 'GH2', 'GH3'];
  const academicBuildings = ['CC1', 'CC2', 'CC3', 'Library', 'Auditorium'];
  const floors = ['Ground Floor', 'First Floor', 'Second Floor', 'Third Floor', 'Fourth Floor'];
  const categories = ['Electricity', 'Water', 'Cleaning', 'Furniture', 'Internet', 'Plumbing', 'Other'];
  const priorities = ['Low', 'Medium', 'High'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Automatically switch default location name when switching location types
    if (name === 'locationType') {
      const defaultLoc = value === 'Hostel' ? 'BH1' : 'CC1';
      setFormData({ ...formData, locationType: value, locationName: defaultLoc });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Using FormData object to support standard multipart image files
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    if (image) {
      data.append('image', image);
    }

    try {
      const res = await api.post('/complaints', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.message || 'Complaint submitted successfully!');
      
      // Reset variables on success
      setFormData({
        complaintType: 'Public',
        locationType: 'Hostel',
        locationName: 'BH1',
        floor: 'Ground Floor',
        roomNumber: '',
        category: 'Electricity',
        priority: 'Low',
        title: '',
        description: '',
        additionalInstruction: '',
      });
      setImage(null);
      document.getElementById('imageFile').value = '';
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: 'var(--primary-brown)', marginBottom: '5px' }}>File a Complaint</h2>
        <p style={{ color: 'var(--text-light)' }}>Provide details about the issue to get it resolved quickly.</p>
      </div>

      <div className="card" style={{ maxWidth: '750px', margin: '0 auto', padding: '35px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Row 1: Complaint Type & Priority */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Complaint Visibility</label>
              <select name="complaintType" value={formData.complaintType} onChange={handleChange} style={selectStyle}>
                <option value="Public">Public (Visible to all students)</option>
                <option value="Private">Private (Visible only to Admin & You)</option>
              </select>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Priority Level</label>
              <select name="priority" value={formData.priority} onChange={handleChange} style={selectStyle}>
                {priorities.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Row 2: Location Configuration */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Location Area Type</label>
              <select name="locationType" value={formData.locationType} onChange={handleChange} style={selectStyle}>
                <option value="Hostel">Hostel Complex</option>
                <option value="Academic Building">Academic / Center Block</option>
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Building / Area Name</label>
              <select name="locationName" value={formData.locationName} onChange={handleChange} style={selectStyle}>
                {formData.locationType === 'Hostel' 
                  ? hostels.map(h => <option key={h} value={h}>{h}</option>)
                  : academicBuildings.map(b => <option key={b} value={b}>{b}</option>)
                }
              </select>
            </div>
          </div>

          {/* Row 3: Floor & Category */}
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>Floor Level</label>
              <select name="floor" value={formData.floor} onChange={handleChange} style={selectStyle}>
                {floors.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={labelStyle}>System Domain Category</label>
              <select name="category" value={formData.category} onChange={handleChange} style={selectStyle}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Conditional Input Block for Private Option Fields */}
          {formData.complaintType === 'Private' && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={labelStyle}>Room Number</label>
                <input 
                  type="text" 
                  name="roomNumber" 
                  placeholder="e.g., 214" 
                  value={formData.roomNumber} 
                  onChange={handleChange} 
                  required 
                  style={inputStyle} 
                />
              </div>
            </div>
          )}

          {/* Structural Content Fields */}
          <div>
            <label style={labelStyle}>Problem Short Summary (Title)</label>
            <input 
              type="text" 
              name="title" 
              placeholder="Brief overview description of the fault..." 
              value={formData.title} 
              onChange={handleChange} 
              required 
              style={inputStyle} 
            />
          </div>

          <div>
            <label style={labelStyle}>Elaborate Problem Description</label>
            <textarea 
              name="description" 
              rows="4" 
              placeholder="State precise details about the breakdown..." 
              value={formData.description} 
              onChange={handleChange} 
              required 
              style={{ ...inputStyle, resize: 'vertical' }} 
            />
          </div>

          {/* Conditional Instructions Block */}
          {formData.complaintType === 'Private' && (
            <div>
              <label style={labelStyle}>Additional Attendance Availability Instructions</label>
              <input 
                type="text" 
                name="additionalInstruction" 
                placeholder="e.g., I am usually available in room after 6 PM." 
                value={formData.additionalInstruction} 
                onChange={handleChange} 
                style={inputStyle} 
              />
            </div>
          )}

          {/* Attachment File upload field */}
          <div>
            <label style={labelStyle}>Evidence File Upload (Optional - Max 1 image)</label>
            <input 
              id="imageFile"
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleFileChange} 
              style={{ ...inputStyle, backgroundColor: '#fafafa' }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '10px', padding: '14px' }} disabled={loading}>
            {loading ? 'Processing Upload Request...' : 'Submit Form Documentation'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

// Form UI Design Definitions
const labelStyle = {
  display: 'block',
  marginBottom: '8px',
  fontWeight: '600',
  fontSize: '0.9rem',
  color: 'var(--primary-brown)',
};

const inputStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s',
};

const selectStyle = {
  ...inputStyle,
  backgroundColor: 'white',
  cursor: 'pointer',
};

export default CreateComplaint;