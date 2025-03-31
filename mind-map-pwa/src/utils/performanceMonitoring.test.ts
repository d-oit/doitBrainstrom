import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  startPerformanceMeasure, 
  endPerformanceMeasure, 
  measureAsyncOperation,
  measureSyncOperation
} from './performanceMonitoring';

describe('Performance Monitoring Tests', () => {
  beforeEach(() => {
    // Setup spies
    vi.spyOn(console, 'time');
    vi.spyOn(console, 'timeEnd');
    vi.spyOn(console, 'log');
    vi.spyOn(performance, 'mark');
    vi.spyOn(performance, 'measure');
    vi.spyOn(performance, 'getEntriesByName').mockReturnValue([
      { name: 'Test Measure', duration: 100 } as PerformanceEntry
    ]);
    vi.spyOn(performance, 'clearMeasures');
    vi.spyOn(performance, 'clearMarks');
  });

  afterEach(() => {
    // Cleanup spies
    vi.restoreAllMocks();
  });

  it('startPerformanceMeasure should create a mark and start console timer', () => {
    const measureName = 'Test Measure';
    startPerformanceMeasure(measureName);
    
    expect(performance.mark).toHaveBeenCalledWith(`start-${measureName}`);
    expect(console.time).toHaveBeenCalledWith(measureName);
  });

  it('endPerformanceMeasure should create a mark, measure, and end console timer', () => {
    const measureName = 'Test Measure';
    const duration = endPerformanceMeasure(measureName);
    
    expect(performance.mark).toHaveBeenCalledWith(`end-${measureName}`);
    expect(performance.measure).toHaveBeenCalledWith(
      measureName, 
      `start-${measureName}`, 
      `end-${measureName}`
    );
    expect(console.timeEnd).toHaveBeenCalledWith(measureName);
    expect(performance.getEntriesByName).toHaveBeenCalledWith(measureName);
    expect(console.log).toHaveBeenCalled();
    expect(performance.clearMeasures).toHaveBeenCalledWith(measureName);
    expect(performance.clearMarks).toHaveBeenCalledTimes(2);
    expect(duration).toBe(100);
  });

  it('measureAsyncOperation should measure async function execution time', async () => {
    const asyncFn = vi.fn().mockResolvedValue('result');
    const result = await measureAsyncOperation('Async Operation', asyncFn);
    
    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(performance.mark).toHaveBeenCalledWith('start-Async Operation');
    expect(performance.mark).toHaveBeenCalledWith('end-Async Operation');
    expect(result).toBe('result');
  });

  it('measureAsyncOperation should handle errors in async functions', async () => {
    const error = new Error('Async error');
    const asyncFn = vi.fn().mockRejectedValue(error);
    
    await expect(measureAsyncOperation('Async Error', asyncFn)).rejects.toThrow('Async error');
    expect(asyncFn).toHaveBeenCalledTimes(1);
    expect(performance.mark).toHaveBeenCalledWith('start-Async Error');
    expect(performance.mark).toHaveBeenCalledWith('end-Async Error');
  });

  it('measureSyncOperation should measure sync function execution time', () => {
    const syncFn = vi.fn().mockReturnValue('result');
    const result = measureSyncOperation('Sync Operation', syncFn);
    
    expect(syncFn).toHaveBeenCalledTimes(1);
    expect(performance.mark).toHaveBeenCalledWith('start-Sync Operation');
    expect(performance.mark).toHaveBeenCalledWith('end-Sync Operation');
    expect(result).toBe('result');
  });

  it('measureSyncOperation should handle errors in sync functions', () => {
    const error = new Error('Sync error');
    const syncFn = vi.fn().mockImplementation(() => {
      throw error;
    });
    
    expect(() => measureSyncOperation('Sync Error', syncFn)).toThrow('Sync error');
    expect(syncFn).toHaveBeenCalledTimes(1);
    expect(performance.mark).toHaveBeenCalledWith('start-Sync Error');
    expect(performance.mark).toHaveBeenCalledWith('end-Sync Error');
  });
});
