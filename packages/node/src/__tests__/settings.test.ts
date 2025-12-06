import { validateSettings } from '../app/settings'
import { CfEvents } from '../app/analytics-node'

describe('validateSettings', () => {
  describe('cloudflarePipelineUrl validation', () => {
    it('should throw an error if cloudflarePipelineUrl is undefined', () => {
      expect(() =>
        validateSettings({ cloudflarePipelineUrl: undefined as any })
      ).toThrowError(/cloudflarePipelineUrl/i)
    })

    it('should throw an error if cloudflarePipelineUrl is null', () => {
      expect(() =>
        validateSettings({ cloudflarePipelineUrl: null as any })
      ).toThrowError(/cloudflarePipelineUrl/i)
    })

    it('should throw an error if cloudflarePipelineUrl is empty string', () => {
      expect(() =>
        validateSettings({ cloudflarePipelineUrl: '' as any })
      ).toThrowError(/cloudflarePipelineUrl/i)
    })

    it('should not throw if cloudflarePipelineUrl is a valid string', () => {
      expect(() =>
        validateSettings({ cloudflarePipelineUrl: 'https://example.com' })
      ).not.toThrow()
    })
  })

  describe('fail-fast behavior (no fallback to host)', () => {
    it('should fail fast and NOT fall back to host setting when cloudflarePipelineUrl is missing', () => {
      // Even though 'host' is provided, it should still throw because cloudflarePipelineUrl is required
      expect(
        () =>
          new CfEvents({
            cloudflarePipelineUrl: undefined as any,
            host: 'https://fallback-host.com',
            writeKey: 'test-key',
          })
      ).toThrowError(/cloudflarePipelineUrl/i)
    })

    it('should fail fast when cloudflarePipelineUrl is empty string, even with host provided', () => {
      expect(
        () =>
          new CfEvents({
            cloudflarePipelineUrl: '',
            host: 'https://fallback-host.com',
            writeKey: 'test-key',
          })
      ).toThrowError(/cloudflarePipelineUrl/i)
    })

    it('should succeed when cloudflarePipelineUrl is provided (host is ignored)', () => {
      expect(
        () =>
          new CfEvents({
            cloudflarePipelineUrl: 'https://primary-pipeline.com',
            host: 'https://fallback-host.com',
            writeKey: 'test-key',
          })
      ).not.toThrow()
    })
  })
})
