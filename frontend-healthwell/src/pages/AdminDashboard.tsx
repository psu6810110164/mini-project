import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Shield, Search, Calendar, User, Trash2, XCircle } from 'lucide-react';
import './Dashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => { fetchAppointments(); }, []);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      alert('โหลดข้อมูลไม่สำเร็จ'); navigate('/');
    }
  };

  const confirmDelete = async (id: number) => {
    try {
      await api.delete(`/appointments/${id}`);
      setAppointments(prev => prev.filter(item => item.id !== id));
      setDeleteId(null);
    } catch (error) {
      alert('ลบไม่สำเร็จ');
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const filteredAppointments = appointments.filter(app => {
    const user = app.user || {}; 
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const cardId = (user.username || user.cardId || '').toLowerCase(); 
    const doctor = (app.doctorName || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    return fullName.includes(search) || doctor.includes(search) || cardId.includes(search);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        {/* --- Header --- */}
        <div className="dashboard-header" style={{ paddingBottom: '0', borderBottom: 'none' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', padding: '16px', borderRadius: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.3)', minWidth: '60px', height: '60px' }}>
                 <Shield color="white" size={32} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#1e293b' }}>Admin Portal</h1>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>ระบบจัดการคิวและข้อมูลผู้ป่วย</span>
              </div>
            </div>
            <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
              <Search className="search-icon" size={20} color="#94a3b8" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" className="form-input" placeholder="ค้นหาชื่อ, เลขบัตร หรือแพทย์..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ paddingLeft: '45px', textAlign: 'left' }} />
            </div>
        </div>

        {/* --- Table --- */}
        <div className="table-container" style={{ marginTop: '20px', maxHeight: '400px', overflowY: 'auto' }}>
            <table className="styled-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>No.</th>
                  <th>ผู้ป่วย</th>
                  <th>แพทย์</th>
                  <th>วัน-เวลา</th>
                  <th>อาการ</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign:'center', padding: '30px', color:'#94a3b8' }}>ไม่พบข้อมูล</td></tr>
                ) : (
                  filteredAppointments.map((item, index) => (
                    <tr key={item.id}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                      
                      {/* ✅ แก้ตรงนี้: ดึงข้อมูลจาก item.user */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                           <span style={{ fontWeight: 'bold', color: '#334155' }}>
                             {item.user?.firstName || 'ไม่ระบุชื่อ'} {item.user?.lastName || ''}
                           </span>
                           <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                             <User size={12}/> {item.user?.username || item.user?.cardId || '-'}
                           </span>
                        </div>
                      </td>

                      <td><span className="badge confirmed" style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>{item.doctorName}</span></td>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'6px', fontSize: '0.9rem' }}>
                          <Calendar size={14} color="#64748b"/>
                          {new Date(item.date).toLocaleString('th-TH', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.symptom}>{item.symptom || "-"}</td>
                      
                      <td style={{ textAlign: 'center' }}>
                        {deleteId === item.id ? (
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                            <button onClick={() => confirmDelete(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>ลบ!</button>
                            <button onClick={() => setDeleteId(null)} style={{ background: '#e2e8f0', color: '#64748b', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><XCircle size={16} /></button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(item.id)} style={{ background: '#fee2e2', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444' }} title="ลบคิวนี้"><Trash2 size={18} /></button>
                        )}
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
        </div>

        <div className="logout-container" style={{ marginTop: 'auto', paddingTop: '30px' }}>
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={18} /> ออกจากระบบ Admin
            </button>
        </div>

      </div>
    </div>
  );
}