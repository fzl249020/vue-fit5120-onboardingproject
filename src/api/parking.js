// src/api/parking.js
import { get } from '../lib/http';

const csv = v => (Array.isArray(v) ? v.join(',') : v);

// Build a clean params object that only contains real values
function buildParams(p = {}) {
  const q = {};
  if (p.street) q.street = p.street;
  if (p.zone !== undefined && p.zone !== null && p.zone !== '') q.zone = p.zone;

  if (Array.isArray(p.years)  && p.years.length)  q.years  = csv(p.years);
  if (Array.isArray(p.months) && p.months.length) q.months = csv(p.months);
  if (Array.isArray(p.days)   && p.days.length)   q.days   = csv(p.days); // e.g. "Mon,Tue"

  if (p.hh !== undefined && p.hh !== null && p.hh !== '') q.hh = p.hh;
  if (p.mm !== undefined && p.mm !== null && p.mm !== '') q.mm = p.mm;
  return q;
}

// 1) Markers (default, search, filters)
export const getParkingMarkers = (params = {}) =>
  get('/api/parking/markers', buildParams(params));

// 2) Optional helpers
export const getParkingMeta = () =>
  get('/api/parking/meta');

export const checkParkingExists = (params = {}) =>
  get('/api/parking/exists', buildParams(params));
