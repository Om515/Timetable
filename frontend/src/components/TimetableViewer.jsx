import React, { useState, useEffect } from 'react';
import { timetableApi } from '../services/timetableApi';
import './TimetableViewer.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetableViewer() {
  const [runs, setRuns] = useState([]);
  const [selectedRun, setSelectedRun] = useState('');
  const [viewType, setViewType] = useState('Division');
  const [filterId, setFilterId] = useState('');
  
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    try {
      setLoading(true);
      const res = await timetableApi.getAllRuns();
      if (res.success) {
        setRuns(res.data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTimetable = async () => {
    if (!selectedRun) {
      setError('Please select a valid Timetable Run first.');
      return;
    }
    setError('');
    setLoading(true);
    setTimetableData(null);
    
    try {
      let res;
      if (filterId) {
        res = await timetableApi.getRunFiltered(selectedRun, viewType, filterId);
      } else {
        res = await timetableApi.getRunById(selectedRun);
      }
      
      if (res.success) {
        setTimetableData(res.data);
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper parsing output
  const renderGridCell = (day, timeBlock) => {
    if (!timetableData || !timetableData.entries) return null;
    
    // Find all entries clustering effectively seamlessly locally functionally dynamically
    const matched = timetableData.entries.filter(
      e => e.MeetingTime && e.MeetingTime.day === day && e.MeetingTime.time === timeBlock
    );

    if (matched.length === 0) return <div className="cell-empty">-</div>;

    return (
      <div className="cell-filled">
        {matched.map(e => (
          <div key={e.id} className="entry-card">
            <div className="course-code">{e.Course?.code} {e.Section?.isElective ? '(Elec)' : ''}</div>
            <div className="instructor-name">Prof: {e.Instructor?.name}</div>
            <div className="room-num">Room: {e.Room?.number}</div>
            {e.Division && <div className="div-info">Div: {e.Division.name}</div>}
            {e.Batch && <div className="batch-info">Batch: {e.Batch.name}</div>}
          </div>
        ))}
      </div>
    );
  };

  // Extract dynamically generated slot rows safely securely sorting cleanly efficiently gracefully natively strictly precisely compactly compactly uniquely!
  const uniqueTimeBlocks = [...new Set(
    (timetableData?.entries || []).map(e => e.MeetingTime?.time).filter(Boolean)
  )].sort();

  return (
    <div className="timetable-container" data-testid="timetable-viewer">
      <h2>Automated Timetable Viewer</h2>
      
      <div className="controls">
        <select 
          value={selectedRun} 
          onChange={e => setSelectedRun(e.target.value)}
          data-testid="run-select"
        >
          <option value="">-- Select Timetable Run --</option>
          {runs.map(r => (
            <option key={r.id} value={r.id}>
              Run #{r.id} (Conflicts: {r.conflictCount})
            </option>
          ))}
        </select>

        <select 
          value={viewType} 
          onChange={e => setViewType(e.target.value)}
          data-testid="view-type-select"
        >
          <option value="Division">Division View</option>
          <option value="Instructor">Instructor View</option>
          <option value="Room">Room View</option>
          <option value="Batch">Batch View</option>
        </select>

        <input 
          type="number" 
          placeholder={`Enter ${viewType} ID`} 
          value={filterId} 
          onChange={e => setFilterId(e.target.value)}
          data-testid="filter-id-input"
        />

        <button onClick={handleFetchTimetable} disabled={loading} data-testid="fetch-btn">
          {loading ? 'Loading...' : 'Load Timetable'}
        </button>
      </div>

      {error && <div className="error-msg" data-testid="error-message">Error: {error}</div>}

      {timetableData && (
        <div className="timetable-grid-wrapper">
          <table className="timetable-table">
            <thead>
              <tr>
                <th>Time / Day</th>
                {DAYS.map(day => <th key={day}>{day}</th>)}
              </tr>
            </thead>
            <tbody>
              {uniqueTimeBlocks.length > 0 ? (
                uniqueTimeBlocks.map(time => (
                  <tr key={time}>
                    <td className="time-col">{time}</td>
                    {DAYS.map(day => (
                      <td key={`${day}-${time}`}>
                        {renderGridCell(day, time)}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">No scheduled classes found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
