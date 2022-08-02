import { inspectVersion } from '../src/utils/version'

describe('get version', () => {
  it('version', async () => {
    expect(await inspectVersion()).toMatchInlineSnapshot(`
      [
        true,
        "0.0.1",
        "0.0.1",
      ]
    `)
  })
})
