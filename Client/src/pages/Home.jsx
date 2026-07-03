import React from 'react';
import { Link } from 'react-router-dom';

// Tumhari 6 real college images
import room from '../assets/room.jpeg';
import library from '../assets/library.jpeg';
import ground from '../assets/ground.jpeg';
import hostelBuilding from '../assets/hostel building.jpeg';
import lab from '../assets/lab.jpeg';
import mainGate from '../assets/main gate.jpeg';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-cream)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Text Section */}
      <section style={{ textAlign: 'center', paddingTop: '60px', paddingBottom: '30px', paddingX: '20px' }}>
        <h1 style={{ fontSize: '3.5rem', color: 'var(--primary-brown)', marginBottom: '15px', fontWeight: '700' }}>
          Spot It, Report It, Fix It!
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', maxWidth: '600px', margin: '0 auto 35px', lineHeight: '1.6' }}>
          Join our community-driven platform to report and track local issues. Together, we can make our campus better, each fix matters.
        </p>
        
        {/* Exact Match Get Started Box */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '8px 8px 8px 24px',
          maxWidth: '450px', 
          margin: '0 auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
        }}>
          <span style={{ color: 'var(--text-light)', fontSize: '1rem' }}>Get Started ...</span>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button style={{ 
              backgroundColor: 'var(--accent-orange)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              width: '45px', 
              height: '45px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer'
            }}>
              &rarr;
            </button>
          </Link>
        </div>
      </section>

      {/* Perfect Reference Layout Gallery */}
      <section style={{ padding: '0 40px 40px 40px', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-end', // Yeh sabhi images ko neeche se ek straight line me align karega!
          gap: '20px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          height: '420px' // Container ki fixed height
        }}>
          
          {/* Col 1: Room (Vertical - Left edge) */}
          <div style={{ flex: '1', height: '80%', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={room} alt="Hostel Room" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Col 2: Stacked Images (Library up, Ground down) */}
          <div style={{ flex: '1.2', display: 'flex', flexDirection: 'column', gap: '20px', height: '75%' }}>
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden' }}>
              <img src={library} alt="Library" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, borderRadius: '16px', overflow: 'hidden' }}>
              <img src={ground} alt="Ground" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          </div>

          {/* Col 3: Hostel Building (Vertical - Middle) */}
          <div style={{ flex: '0.9', height: '65%', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={hostelBuilding} alt="Hostel Building" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Col 4: Lab (Horizontal - Bottom aligned) */}
          <div style={{ flex: '1.2', height: '45%', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={lab} alt="Computer Lab" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Col 5: Main Gate (Large Vertical - Right edge) */}
          <div style={{ flex: '1.5', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={mainGate} alt="Main Gate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

        </div>
      </section>

    </div>
  );
};

export default Home;