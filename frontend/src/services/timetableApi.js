// Use Vite's development proxy by default so the frontend never depends on a
// hard-coded backend host. Set VITE_API_BASE_URL when deploying separately.
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/timetable';

export const timetableApi = {
  getAllRuns: async () => {
    const res = await fetch(`${API_BASE}`);
    if (!res.ok) throw new Error('Failed to fetch available timetable runs.');
    return res.json();
  },
  getRunById: async (id) => {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error('Timetable ID not found or server error.');
    return res.json();
  },
  getRunFiltered: async (id, filterType, filterId) => {
    const typeMapping = { Division: 'division', Instructor: 'instructor', Room: 'room', Batch: 'batch' };
    const path = typeMapping[filterType];
    const res = await fetch(`${API_BASE}/${id}/${path}/${filterId}`);
    if (!res.ok) throw new Error(`Could not fetch data for ${filterType} ${filterId}`);
    return res.json();
  }
};
