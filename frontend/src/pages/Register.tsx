import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
// เพิ่ม import Eye, EyeOff เข้ามาด้วย
import { User, Lock, UserPlus, Eye, EyeOff } from 'lucide-react';
import './Login.css'; // ใช้ CSS เดิม สวยเหมือนกันเป๊ะ

export default function Register() {
  const [citizenId, setCitizenId] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // เพิ่ม State สำหรับสลับดูรหัสผ่าน
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (citizenId.length !== 13) {
      alert('⚠️ เลขบัตรประชาชนต้องมี 13 หลัก');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { 
        username: citizenId, 
        password,
        firstName,
        lastName
      });
      navigate('/');
    } catch (error) {
      alert('❌ สมัครไม่ผ่าน: เลขบัตรนี้อาจมีในระบบแล้ว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '800px', width: '70%', minHeight: '90vh' }}>
        {/* Header */}
        <div className="header">
          {/* โลโก้สีเขียว Emerald */}
          <div className="logo-circle" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}> 
            <UserPlus size={32} color="white" />
          </div>
          <h1 className="login-title">ลงทะเบียนผู้ใช้ใหม่</h1>
          <p className="login-subtitle">ระบบบริหารจัดการคลินิก HealthWell</p>
        </div>

        <form onSubmit={handleRegister}>
          {/* 1. ช่องเลขบัตรประชาชน */}
          <div className="form-group">
            <label className="form-label">เลขบัตรประชาชน</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                className="custom-input"
                placeholder="เลขบัตรประชาชน 13 หลัก" 
                maxLength={13}
                value={citizenId}
                onChange={e => setCitizenId(e.target.value.replace(/\D/g, ''))} 
                required
              />
            </div>
          </div>

          {/* 2. ชื่อ - นามสกุล */}
          <div className="form-group">
            <label className="form-label">ชื่อจริง</label>
            <input 
              type="text" className="custom-input" placeholder="ไม่ต้องใส่คำนำหน้า"
              style={{ paddingLeft: '15px' }} // ปรับ padding เพราะไม่มีไอคอน
              value={firstName} onChange={e => setFirstName(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">นามสกุล</label>
            <input 
              type="text" className="custom-input" placeholder="นามสกุล"
              style={{ paddingLeft: '15px' }}
              value={lastName} onChange={e => setLastName(e.target.value)} required
            />
          </div>
          

          {/* 3. รหัสผ่าน (พร้อมปุ่มลูกตา 👁️) */}
          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input 
                // สลับ type ตาม state showPassword
                type={showPassword ? "text" : "password"} 
                className="custom-input"
                placeholder="ตั้งรหัสผ่านของคุณ" 
                value={password}
                onChange={e => setPassword(e.target.value)} 
                required
              />
              
              {/* ปุ่มกดสลับ */}
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn" 
            disabled={loading}
            style={{ background: 'linear-gradient(to right, #10b981, #059669)' }}
          >
            {loading ? 'กำลังบันทึกข้อมูล...' : 'ลงทะเบียน'}
          </button>
        </form>

        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <p className="footer-text" style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
            มีบัญชีอยู่แล้ว?
          </p>
          <Link to="/" style={{ color: '#059669', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}