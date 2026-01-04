import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, CheckCircle, XCircle, Trash2, Shield, Calendar, Search } from 'lucide-react';
import './Dashboard.css'; // 👈 สำคัญ! ต้อง import ไฟล์ CSS นี้เข้ามา

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [filter, setFilter] = useState(''); // (แถม) เพิ่มระบบค้นหาให้ด้วย

  useEffect(() => {
    fetchAllAppointments();
  }, []);

  const fetchAllAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      navigate('/');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    if (!confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${status}?`)) return;
    try {
      await api.patch(`/appointments/${id}`, { status });
      fetchAllAppointments();
    } catch (error) {
      alert('Error');
    }
  };

  const deleteAppointment = async (id: number) => {
    if (!confirm('ยืนยันลบข้อมูล?')) return;
    try {
      await api.delete(`/appointments/${id}`);
      fetchAllAppointments();
    } catch (error) {
      alert('Error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // กรองข้อมูลตามที่ค้นหา
  const filteredAppointments = appointments.filter(item => 
    item.user?.username?.includes(filter) || 
    item.user?.firstName?.includes(filter) ||
    item.doctorName?.includes(filter)
  );

  return (
    <div className="dashboard-container"> {/* 👈 คลาสนี้จะทำให้พื้นหลังเต็มจอ */}
      <div className="dashboard-card"> 
        
        {/* Header */}
        <div className="dashboard-header">
          <div className="header-title">
            <div style={{ background: '#f59e0b', padding: '10px', borderRadius: '12px', display: 'flex', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}>
               <Shield color="white" size={28} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>Admin Portal</h1>
              <span style={{ color: '#64748b' }}>ระบบจัดการคิวและข้อมูลผู้ป่วย</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} /> Logout
          </button>
        </div>

        {/* Search Bar (แถมให้) */}
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ, เลขบัตร หรือชื่อหมอ..." 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px', maxWidth: '300px' }}
          />
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>ผู้ป่วย (เลขบัตร)</th>
                <th>ชื่อ-นามสกุล</th>
                <th>แพทย์</th>
                <th>วัน-เวลา</th>
                <th>อาการ</th>
                <th>สถานะ</th>
                <th style={{ textAlign: 'center' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length === 0 ? (
                 <tr><td colSpan={8} style={{textAlign: 'center', padding: '30px', color: '#94a3b8'}}>ไม่พบข้อมูลการจอง</td></tr>
              ) : (
                filteredAppointments.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td style={{ fontWeight: '600', color: '#334155' }}>{item.user?.username || 'N/A'}</td>
                    <td>{item.user?.firstName} {item.user?.lastName}</td>
                    <td>
                      <span style={{ background: '#eff6ff', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                        {item.doctorName}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={14} color="#64748b"/> 
                          {new Date(item.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>{item.symptom}</td>
                    <td>
                      <span className={`badge ${item.status}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        {item.status === 'pending' && (
                          <button title="อนุมัติ" onClick={() => updateStatus(item.id, 'confirmed')} className="action-btn btn-approve">
                            <CheckCircle size={20} />
                          </button>
                        )}
                        
                        {item.status !== 'cancelled' && (
                          <button title="ยกเลิก" onClick={() => updateStatus(item.id, 'cancelled')} className="action-btn btn-cancel">
                            <XCircle size={20} />
                          </button>
                        )}

                        <button title="ลบ" onClick={() => deleteAppointment(item.id)} className="action-btn btn-delete">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <p style={{ marginTop: '20px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center' }}>
          System ID: ADMIN-ACCESS-LEVEL-1 • HealthWell Database
        </p>

      </div>
    </div>
  );
}