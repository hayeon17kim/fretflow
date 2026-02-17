/**
 * Phase Helpers Unit Tests
 *
 * Tests for phase distribution logic and card count calculations
 * Related to P2-17 (Phase System) and P2-10 (Unit Tests)
 */

import {
  getPhaseDistribution,
  selectPhaseForCard,
  getPhaseCardCounts,
} from '@/utils/phaseHelpers';
import type { Phase } from '@/stores/usePhaseStore';

describe('phaseHelpers', () => {
  describe('getPhaseDistribution', () => {
    it('should return 100% for Phase 1', () => {
      const distribution = getPhaseDistribution(1);
      expect(distribution).toEqual({ 1: 100 });
    });

    it('should return 30/70 split for Phase 2', () => {
      const distribution = getPhaseDistribution(2);
      expect(distribution).toEqual({ 1: 30, 2: 70 });
    });

    it('should return 10/30/60 split for Phase 3', () => {
      const distribution = getPhaseDistribution(3);
      expect(distribution).toEqual({ 1: 10, 2: 30, 3: 60 });
    });

    it('should default to 100% for invalid phase', () => {
      const distribution = getPhaseDistribution(0 as Phase);
      expect(distribution).toEqual({ 1: 100 });
    });
  });

  describe('selectPhaseForCard', () => {
    it('should always return 1 when only Phase 1 is unlocked', () => {
      const results = Array.from({ length: 100 }, () => selectPhaseForCard(1));
      expect(results.every((r) => r === 1)).toBe(true);
    });

    it('should return Phase 1 or 2 when Phase 2 is unlocked', () => {
      const results = Array.from({ length: 100 }, () => selectPhaseForCard(2));
      expect(results.every((r) => r === 1 || r === 2)).toBe(true);
    });

    it('should return Phase 1, 2, or 3 when Phase 3 is unlocked', () => {
      const results = Array.from({ length: 100 }, () => selectPhaseForCard(3));
      expect(results.every((r) => r === 1 || r === 2 || r === 3)).toBe(true);
    });

    it('should approximately follow 30/70 distribution for Phase 2', () => {
      const iterations = 1000;
      const results = Array.from({ length: iterations }, () => selectPhaseForCard(2));
      const phase1Count = results.filter((r) => r === 1).length;
      const phase2Count = results.filter((r) => r === 2).length;

      // Allow 10% margin of error
      const phase1Ratio = phase1Count / iterations;
      const phase2Ratio = phase2Count / iterations;

      expect(phase1Ratio).toBeGreaterThan(0.2); // 30% ± 10%
      expect(phase1Ratio).toBeLessThan(0.4);
      expect(phase2Ratio).toBeGreaterThan(0.6); // 70% ± 10%
      expect(phase2Ratio).toBeLessThan(0.8);
    });

    it('should approximately follow 10/30/60 distribution for Phase 3', () => {
      const iterations = 1000;
      const results = Array.from({ length: iterations }, () => selectPhaseForCard(3));
      const phase1Count = results.filter((r) => r === 1).length;
      const phase2Count = results.filter((r) => r === 2).length;
      const phase3Count = results.filter((r) => r === 3).length;

      const phase1Ratio = phase1Count / iterations;
      const phase2Ratio = phase2Count / iterations;
      const phase3Ratio = phase3Count / iterations;

      // Allow 10% margin of error
      expect(phase1Ratio).toBeGreaterThan(0.05); // 10% ± 5%
      expect(phase1Ratio).toBeLessThan(0.15);
      expect(phase2Ratio).toBeGreaterThan(0.2); // 30% ± 10%
      expect(phase2Ratio).toBeLessThan(0.4);
      expect(phase3Ratio).toBeGreaterThan(0.5); // 60% ± 10%
      expect(phase3Ratio).toBeLessThan(0.7);
    });
  });

  describe('getPhaseCardCounts', () => {
    it('should return all cards as Phase 1 when only Phase 1 unlocked', () => {
      const counts = getPhaseCardCounts(10, 1);
      expect(counts).toEqual({ 1: 10 });
    });

    it('should return 3/7 split for 10 cards at Phase 2', () => {
      const counts = getPhaseCardCounts(10, 2);
      expect(counts).toEqual({ 1: 3, 2: 7 });
      expect(counts[1] + counts[2]).toBe(10);
    });

    it('should return 1/3/6 split for 10 cards at Phase 3', () => {
      const counts = getPhaseCardCounts(10, 3);
      expect(counts).toEqual({ 1: 1, 2: 3, 3: 6 });
      expect(counts[1] + counts[2] + counts[3]).toBe(10);
    });

    it('should handle 20 cards at Phase 2 correctly', () => {
      const counts = getPhaseCardCounts(20, 2);
      expect(counts).toEqual({ 1: 6, 2: 14 });
      expect(counts[1] + counts[2]).toBe(20);
    });

    it('should handle 20 cards at Phase 3 correctly', () => {
      const counts = getPhaseCardCounts(20, 3);
      expect(counts).toEqual({ 1: 2, 2: 6, 3: 12 });
      expect(counts[1] + counts[2] + counts[3]).toBe(20);
    });

    it('should handle odd number of cards', () => {
      const counts = getPhaseCardCounts(15, 2);
      expect(counts[1] + counts[2]).toBe(15);

      const counts3 = getPhaseCardCounts(15, 3);
      expect(counts3[1] + counts3[2] + counts3[3]).toBe(15);
    });

    it('should always sum to total card count', () => {
      for (let total = 1; total <= 50; total++) {
        for (let phase = 1; phase <= 3; phase++) {
          const counts = getPhaseCardCounts(total, phase as Phase);
          const sum = Object.values(counts).reduce((a, b) => a + b, 0);
          expect(sum).toBe(total);
        }
      }
    });

    it('should respect percentage ratios within ±1 card', () => {
      // Phase 2: 30/70
      const counts2 = getPhaseCardCounts(100, 2);
      expect(counts2[1]).toBeGreaterThanOrEqual(29);
      expect(counts2[1]).toBeLessThanOrEqual(31);
      expect(counts2[2]).toBeGreaterThanOrEqual(69);
      expect(counts2[2]).toBeLessThanOrEqual(71);

      // Phase 3: 10/30/60
      const counts3 = getPhaseCardCounts(100, 3);
      expect(counts3[1]).toBeGreaterThanOrEqual(9);
      expect(counts3[1]).toBeLessThanOrEqual(11);
      expect(counts3[2]).toBeGreaterThanOrEqual(29);
      expect(counts3[2]).toBeLessThanOrEqual(31);
      expect(counts3[3]).toBeGreaterThanOrEqual(59);
      expect(counts3[3]).toBeLessThanOrEqual(61);
    });
  });

  describe('Edge Cases', () => {
    it('should handle single card for Phase 2', () => {
      const counts = getPhaseCardCounts(1, 2);
      expect(counts[1] + counts[2]).toBe(1);
      // Single card should go to higher phase (Phase 2)
      expect(counts[2]).toBe(1);
    });

    it('should handle single card for Phase 3', () => {
      const counts = getPhaseCardCounts(1, 3);
      expect(counts[1] + counts[2] + counts[3]).toBe(1);
      // Single card should go to highest phase (Phase 3)
      expect(counts[3]).toBe(1);
    });

    it('should handle 2 cards for Phase 3', () => {
      const counts = getPhaseCardCounts(2, 3);
      expect(counts[1] + counts[2] + counts[3]).toBe(2);
    });
  });
});
