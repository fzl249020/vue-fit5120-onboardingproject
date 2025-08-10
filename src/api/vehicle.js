// src/api/vehicle.js
import { get } from '../lib/http';

// 24 个季度（2016Q1 ~ 2021Q4）
export const getVicQuarterly = (params = {}) =>
  get('/api/vehicle/quarterly', params);
