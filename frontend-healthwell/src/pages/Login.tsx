import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff, User, Lock, Activity } from 'lucide-react';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState(''); // ใช้เก็บเลขบัตรประชาชน
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // simulate loading
      await new Promise(r => setTimeout(r, 800)); 

      const response = await api.post('/auth/login', { username, password });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('firstName', response.data.firstName);
      localStorage.setItem('lastName', response.data.lastName || '');

      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      alert('เข้าสู่ระบบไม่ผ่าน: กรุณาตรวจสอบเลขบัตรหรือรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header Section */}
        <div className="header">
          <div className="logo-circle">
            <Activity size={32} color="white" />
          </div>
          <h1 className="login-title">HealthWell</h1>
          <p className="login-subtitle">Hospital Management System</p>
        </div>

        <form onSubmit={handleLogin}>
          {/* ช่องกรอกเลขบัตรประชาชน (แก้ไข Label และ Placeholder แล้ว) */}
          <div className="form-group">
            <label className="form-label">เลขบัตรประชาชน</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input 
                type="text" 
                className="custom-input"
                placeholder="เลขบัตรประชาชน 13 หลัก" 
                maxLength={13}
                value={username}
                onChange={e => setUsername(e.target.value)} 
                required
              />
            </div>
          </div>

          {/* ช่องกรอกรหัสผ่าน */}
          <div className="form-group">
            <label className="form-label">รหัสผ่าน</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                className="custom-input"
                placeholder="กรอกรหัสผ่านของคุณ" 
                value={password}
                onChange={e => setPassword(e.target.value)} 
                required
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* ปุ่ม Login */}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        {/* 👇 ส่วนปุ่มสมัครสมาชิก (Register Link) อยู่ตรงนี้ครับ */}
        <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '15px' }}>
          <p className="footer-text" style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
            ยังไม่มีบัญชีใช่ไหม?
          </p>
          <Link to="/register" style={{ 
            color: '#2563eb', 
            fontWeight: 'bold', 
            textDecoration: 'none',
            fontSize: '1rem' 
          }}>
            ลงทะเบียนผู้ใช้ใหม่
          </Link>
        </div>

        <p className="footer-text">© 2026 HealthWell Corporation</p>
      </div>
    </div>
  );
}