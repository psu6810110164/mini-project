import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Calendar, Clock, User, PlusCircle } from 'lucide-react';
import './Dashboard.css';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Strange');
  const [date, setDate] = useState('');
  const [symptom, setSymptom] = useState('');

  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName') || '';
  const displayName = firstName ? `${firstName} ${lastName}` : localStorage.getItem('username');

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/appointments/my-history');
      setAppointments(res.data);
    } catch (error) { navigate('/'); }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/appointments', { doctorName, date: new Date(date).toISOString(), symptom });
      fetchHistory(); setSymptom(''); setDate('');
    } catch (error: any) { alert('⚠️ จองไม่สำเร็จ: ' + (error.response?.data?.message || 'Error')); }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        
        {/* --- ส่วนหัว (เหลือแค่รูปกับชื่อ ปุ่ม Logout หายไปแล้ว) --- */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
            <div style={{ 
              background: '#3b82f6', padding: '16px', borderRadius: '50%',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', marginBottom: '5px'
            }}>
               <User color="white" size={40} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#1e293b' }}>
                สวัสดี, คุณ {displayName}
              </h1>
              <span style={{ color: '#64748b', fontSize: '0.95rem' }}>ยินดีต้อนรับสู่ HealthWell</span>
            </div>
          </div>
        </div>

        {/* --- เนื้อหา --- */}
        
        {/* ส่วนจองคิว */}
        <div>
           <h3 className="section-title">
              <PlusCircle size={24} color="#3b82f6"/> จองคิวตรวจใหม่
            </h3>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>เลือกแพทย์</label>
                <select className="form-select" value={doctorName} onChange={e => setDoctorName(e.target.value)}>
                  <option value="Dr. Strange">Dr. Strange </option>
                  <option value="Dr. House">Dr. House </option>
                  <option value="Dr. Who">Dr. Who </option>
                </select>
              </div>
              <div className="form-group">
                <label>วันและเวลา</label>
                <input type="datetime-local" className="form-input" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>อาการเบื้องต้น</label>
                <textarea className="form-input" rows={3} placeholder="เช่น ปวดหัว, ตัวร้อน, ไอแห้งๆ" value={symptom} onChange={e => setSymptom(e.target.value)} required />
              </div>
              <button type="submit" className="primary-btn">ยืนยันการจอง</button>
            </form>
        </div>

        {/* ✅ ส่วนประวัติ (เพิ่ม Class ให้เว้นห่าง) */}
        <div className="history-section">
            <h3 className="section-title">
              <Clock size={24} color="#3b82f6"/> ประวัติการนัดหมาย
            </h3>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr><th>วันที่ & เวลา</th><th>แพทย์</th><th>อาการ</th><th>สถานะ</th></tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan={4} style={{ textAlign:'center', padding: '30px', color:'#94a3b8' }}>ยังไม่มีประวัติการจอง</td></tr>
                  ) : (
                    appointments.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                            <Calendar size={16} color="#64748b"/>
                            {new Date(item.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </td>
                        <td>{item.doctorName}</td>
                        <td>{item.symptom}</td>
                        <td><span className={`badge ${item.status}`}>{item.status.toUpperCase()}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
        </div>

        {/* ✅ ปุ่ม Logout (ย้ายมาล่างสุด ตรงนี้!) */}
        <div className="logout-container">
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> ออกจากระบบ
            </button>
        </div>

      </div>
    </div>
  );
}