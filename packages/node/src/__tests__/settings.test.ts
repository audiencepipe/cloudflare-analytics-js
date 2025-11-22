import { validateSettings } from '../app/settings'

describe('validateSettings', () => {
  it('should throw an error if no cloudflarePipelineUrl', () => {
    expect(() =>
      validateSettings({ cloudflarePipelineUrl: undefined as any })
    ).toThrowError(/cloudflarePipelineUrl/i)
  })
})
