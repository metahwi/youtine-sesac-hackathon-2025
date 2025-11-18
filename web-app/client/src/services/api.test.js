import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { videoAPI, routineAPI, logAPI, dashboardAPI } from './api';

// Mock axios
vi.mock('axios');

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('videoAPI', () => {
    it('should have addVideo method', () => {
      expect(videoAPI.addVideo).toBeInstanceOf(Function);
    });

    it('should have getAllVideos method', () => {
      expect(videoAPI.getAllVideos).toBeInstanceOf(Function);
    });

    it('should have getVideo method', () => {
      expect(videoAPI.getVideo).toBeInstanceOf(Function);
    });

    it('should have deleteVideo method', () => {
      expect(videoAPI.deleteVideo).toBeInstanceOf(Function);
    });
  });

  describe('routineAPI', () => {
    it('should have createRoutine method', () => {
      expect(routineAPI.createRoutine).toBeInstanceOf(Function);
    });

    it('should have getAllRoutines method', () => {
      expect(routineAPI.getAllRoutines).toBeInstanceOf(Function);
    });

    it('should have getRoutine method', () => {
      expect(routineAPI.getRoutine).toBeInstanceOf(Function);
    });

    it('should have updateRoutine method', () => {
      expect(routineAPI.updateRoutine).toBeInstanceOf(Function);
    });

    it('should have deleteRoutine method', () => {
      expect(routineAPI.deleteRoutine).toBeInstanceOf(Function);
    });
  });

  describe('logAPI', () => {
    it('should have all required methods', () => {
      expect(logAPI.createLog).toBeInstanceOf(Function);
      expect(logAPI.getLogs).toBeInstanceOf(Function);
      expect(logAPI.getLog).toBeInstanceOf(Function);
      expect(logAPI.updateLog).toBeInstanceOf(Function);
      expect(logAPI.deleteLog).toBeInstanceOf(Function);
      expect(logAPI.getExerciseHistory).toBeInstanceOf(Function);
    });
  });

  describe('dashboardAPI', () => {
    it('should have all required methods', () => {
      expect(dashboardAPI.getStats).toBeInstanceOf(Function);
      expect(dashboardAPI.getCalendar).toBeInstanceOf(Function);
      expect(dashboardAPI.getProgress).toBeInstanceOf(Function);
    });
  });

  describe('API base configuration', () => {
    it('should use correct base URL from environment', () => {
      expect(import.meta.env.VITE_API_URL).toBe('/api');
    });
  });
});
