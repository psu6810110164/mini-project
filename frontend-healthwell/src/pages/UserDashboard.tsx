import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { LogOut, Calendar, Clock, User, PlusCircle, Edit2, X, Save } from 'lucide-react';
import './Dashboard.css';
import type { Appointment, TimeSlot } from '../interfaces'; // ✅ Import Type ที่สร้างไว้

export default function UserDashboard() {
  const navigate = useNavigate();
  // ✅ 1. ระบุ Type ให้ State แทนการใช้ any[]
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // --- State สำหรับการ "จองใหม่" ---
  const [doctorName, setDoctorName] = useState('Dr. Strange');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  // ✅ 2. ระบุ Type สำหรับ TimeSlot
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [symptom, setSymptom] = useState('');

  // --- State สำหรับ "แก้ไข" ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // ✅ 3. ระบุ Type สำหรับ Object ที่กำลังแก้ไข (อาจเป็น null ได้)
  const [editingItem, setEditingItem] = useState<Appointment | null>(null);

  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  // ✅ 4. ระบุ Type สำหรับ TimeSlot ในโหมดแก้ไข
  const [editSlots, setEditSlots] = useState<TimeSlot[]>([]);

  // User Info
  const firstName = localStorage.getItem('firstName');
  const lastName = localStorage.getItem('lastName') || '';
  const displayName = firstName ? `${firstName} ${lastName}` : localStorage.getItem('username');

  useEffect(() => { fetchHistory(); }, []);

  // Effect สำหรับโหลดเวลาจองใหม่
  useEffect(() => {
    if (doctorName && selectedDate) {
      fetchTimeSlots(doctorName, selectedDate, setTimeSlots);
      setSelectedTime('');
    }
  }, [doctorName, selectedDate]);

  // Effect สำหรับโหลดเวลาในหน้า "แก้ไข"
  useEffect(() => {
    if (editingItem && editDate) {
      fetchTimeSlots(editingItem.doctorName, editDate, setEditSlots);
      // ถ้าเปลี่ยนวัน ให้เคลียร์เวลาเดิมทิ้ง เพื่อกันงง
      if (editDate !== editingItem.date.split('T')[0]) {
        setEditTime('');
      }
    }
  }, [editDate, editingItem]);

  const fetchHistory = async () => {
    try {
      const myId = localStorage.getItem('userId');
      const res = await api.get(`/appointments/my-history?userId=${myId}`);
      setAppointments(res.data);
    } catch (error) { navigate('/'); }
  };

  // ✅ 5. ระบุ Type ให้ Arguments ของ Function อย่างชัดเจน
  // setSlotFn รับฟังก์ชันสำหรับเปลี่ยน State ของ TimeSlot[]
  const fetchTimeSlots = async (
    doc: string,
    date: string,
    setSlotFn: React.Dispatch<React.SetStateAction<TimeSlot[]>>
  ) => {
    try {
      const res = await api.get('/appointments/check-availability', {
        params: { doctorName: doc, date: date }
      });
      setSlotFn(res.data);
    } catch (error) {
      console.error('Check slot error', error);
      setSlotFn([]);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      alert('กรุณาเลือกวันที่และเวลาที่ต้องการจอง'); return;
    }
    const finalDate = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    const myId = localStorage.getItem('userId');

    try {
      await api.post('/appointments', { doctorName, date: finalDate, symptom, userId: myId });
      fetchHistory();
      setSymptom(''); setSelectedDate(''); setSelectedTime(''); setTimeSlots([]);
    } catch (error: any) {
      // ใช้ any กับ error ใน catch block ถือเป็นข้อยกเว้นที่ยอมรับได้ในระดับนี้
      alert('⚠️ จองไม่สำเร็จ: ' + (error.response?.data?.message || 'Error'));
    }
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  // ✅ 6. แก้ item: any เป็น Appointment
  const openEditModal = (item: Appointment) => {
    setEditingItem(item);

    // ดึงวันที่เดิมมาใส่ในช่องเลือก
    const originalDate = new Date(item.date);
    const dateStr = originalDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = originalDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); // HH:mm

    setEditDate(dateStr);
    setEditTime(timeStr); // ตั้งค่าเริ่มต้นเป็นเวลาเดิม
    setIsEditModalOpen(true);
  };

  // --- บันทึกการแก้ไข ---
  const handleSaveEdit = async () => {
    if (!editingItem || !editDate || !editTime) {
      alert('กรุณาเลือกวันและเวลาให้ครบถ้วน'); return;
    }

    try {
      const newDateISO = new Date(`${editDate}T${editTime}:00`).toISOString();

      await api.patch(`/appointments/${editingItem.id}`, {
        date: newDateISO,
      });

      alert('✅ แก้ไขเรียบร้อย!');
      setIsEditModalOpen(false);
      setEditingItem(null);
      fetchHistory();
    } catch (error: any) {
      alert('❌ แก้ไขไม่ได้: ' + (error.response?.data?.message || 'คิวชนหรือเกิดข้อผิดพลาด'));
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">

        {/* Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', width: '100%' }}>
            <div style={{ background: '#3b82f6', padding: '16px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)', marginBottom: '5px' }}>
              <User color="white" size={40} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 'bold', color: '#1e293b' }}>สวัสดี, คุณ {displayName}</h1>
              <span style={{ color: '#64748b', fontSize: '0.95rem' }}>ยินดีต้อนรับสู่ HealthWell</span>
            </div>
          </div>
        </div>

        {/* --- Form จอง (จองใหม่) --- */}
        <div>
          <h3 className="section-title"><PlusCircle size={24} color="#3b82f6" /> จองคิวตรวจใหม่</h3>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>เลือกแพทย์</label>
              <select className="form-select" value={doctorName} onChange={e => setDoctorName(e.target.value)}>
                <option value="Dr. Strange">Dr. Strange</option>
                <option value="Dr. House">Dr. House</option>
                <option value="Dr. Who">Dr. Who</option>
              </select>
            </div>

            <div className="form-group">
              <label>เลือกวันที่</label>
              <input type="date" className="form-input" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
            </div>

            {selectedDate && (
              <div className="form-group">
                <label>เลือกเวลาที่ว่าง ({timeSlots.filter(t => t.available).length} คิวว่าง)</label>
                <div className="time-slots-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '10px' }}>
                  {timeSlots.map((slot) => {
                    // เช็คสถานะ: ถ้าจองแล้ว (available=false) ให้เป็นจริง
                    const isTaken = !slot.available;
                    // เช็คสถานะ: ถ้าเราเลือกปุ่มนี้อยู่
                    const isSelected = selectedTime === slot.time;

                    return (
                      <button
                        key={slot.time}
                        // 🛑 1. สั่งปิดปุ่มถ้าจองแล้ว
                        disabled={isTaken}

                        onClick={() => setSelectedTime(slot.time)}

                        // 🎨 2. จัดการสีปุ่ม (3 สถานะ: จองแล้ว / เลือกอยู่ / ว่างปกติ)
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: isTaken ? '1px solid #e2e8f0' : (isSelected ? '1px solid #3b82f6' : '1px solid #cbd5e1'),

                          // พื้นหลัง: จองแล้ว=เทา, เลือก=ฟ้า, ปกติ=ขาว
                          backgroundColor: isTaken ? '#f1f5f9' : (isSelected ? '#3b82f6' : '#ffffff'),

                          // ตัวหนังสือ: จองแล้ว=เทาอ่อน, เลือก=ขาว, ปกติ=ดำ
                          color: isTaken ? '#cbd5e1' : (isSelected ? '#ffffff' : '#334155'),

                          // เมาส์: จองแล้ว=ห้ามกด, ปกติ=รูปมือ
                          cursor: isTaken ? 'not-allowed' : 'pointer',

                          fontWeight: isSelected ? 'bold' : 'normal',
                          transition: 'all 0.2s',

                        }}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="form-group">
              <label>อาการเบื้องต้น</label>
              <textarea className="form-input" rows={3} placeholder="เช่น ปวดหัว, ตัวร้อน..." value={symptom} onChange={e => setSymptom(e.target.value)} required />
            </div>
            <button type="submit" className="primary-btn" disabled={!selectedTime}>ยืนยันการจอง</button>
          </form>
        </div>

        {/* History Table */}
        <div className="history-section">
          <h3 className="section-title"><Clock size={24} color="#3b82f6" /> ประวัติการนัดหมาย</h3>
          <div className="table-container">
            <table className="styled-table">
              <thead><tr><th>วันที่ & เวลา</th><th>แพทย์</th><th>สถานะ</th><th style={{ textAlign: 'center' }}>แก้ไข</th></tr></thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>ยังไม่มีประวัติการจอง</td></tr>
                ) : (
                  appointments.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={16} color="#64748b" />
                          {new Date(item.date).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                      </td>
                      <td>{item.doctorName}</td>
                      <td><span className={`badge ${item.status}`}>{item.status.toUpperCase()}</span></td>
                      <td style={{ textAlign: 'center' }}>
                        <button onClick={() => openEditModal(item)} style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '6px', cursor: 'pointer', color: '#3b82f6' }}>
                          <Edit2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="logout-container"><button onClick={handleLogout} className="logout-btn"><LogOut size={18} /> ออกจากระบบ</button></div>

        {/* ✅ Modal แก้ไข */}
        {isEditModalOpen && editingItem && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}><Edit2 size={24} color="#3b82f6" /> เปลี่ยนวันนัดหมาย</h3>

              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px 0', color: '#64748b' }}>แพทย์: <strong>{editingItem.doctorName}</strong></p>

                {/* 1. เลือกวันที่ใหม่ */}
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>เลือกวันที่ใหม่:</label>
                <input
                  type="date"
                  className="form-input"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />

                {/* 2. แสดงปุ่มเวลา (เหมือนหน้าจอง) */}
                {editDate && (
                  <div style={{ marginTop: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>เลือกเวลา:</label>
                    <div className="time-slot-container">
                      {editSlots.map((slot) => {
                        // 1. เช็คว่าเป็นเวลาเดิมของเราไหม
                        const isMyOwnSlot = (editDate === editingItem.date.split('T')[0]) &&
                          (slot.time === new Date(editingItem.date).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));

                        // 2. เงื่อนไขห้ามกด: (ถ้าคิวไม่ว่าง) หรือ (เป็นเวลาเดิมของเรา) ให้ล็อคเลย 🔒
                        const isLocked = !slot.available || isMyOwnSlot;

                        return (
                          <button
                            type="button"
                            key={slot.time}
                            disabled={isLocked} // 👈 ใส่ตัวล็อคตรงนี้
                            className={`time-slot-btn ${editTime === slot.time ? 'selected' : ''}`}
                            onClick={() => setEditTime(slot.time)}
                          >
                            {slot.time} {isMyOwnSlot ? '(เดิม)' : ''}
                          </button>
                        );
                      })}
                    </div>
                    {/* ข้อความเตือน */}
                    {editSlots.length > 0 && editSlots.every(t => !t.available) && (
                      <p style={{ color: '#ef4444', textAlign: 'center', fontSize: '0.8rem', marginTop: '5px' }}>❌ เต็ม (กรุณาเลือกวันอื่น)</p>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSaveEdit} disabled={!editTime} style={{ flex: 1, background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '5px', opacity: !editTime ? 0.6 : 1 }}>
                  <Save size={18} /> ยืนยันเปลี่ยนวัน
                </button>
                <button onClick={() => setIsEditModalOpen(false)} style={{ flex: 1, background: '#f1f5f9', color: '#64748b', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '5px' }}>
                  <X size={18} /> ยกเลิก
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}