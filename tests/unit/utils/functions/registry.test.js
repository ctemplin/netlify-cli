const test = require('ava')
const sinon = require('sinon')

const { rewiremock } = require('../../../integration/utils/rewiremock')

const watchDebouncedSpy = sinon.stub()
// eslint-disable-next-line n/global-require
const { FunctionsRegistry } = rewiremock.proxy(() => require('../../../../src/lib/functions/registry'), {
  '../../../../src/utils/index': {
    watchDebounced: watchDebouncedSpy,
  },
})

test('should add included_files to watcher', async (t) => {
  watchDebouncedSpy.resolves({})

  const registry = new FunctionsRegistry({})
  const func = {
    name: '',
    config: { functions: { '*': { included_files: ['include/*', '!include/a.txt'] } } },
    build() {
      return { srcFilesDiff: { added: ['myfile'] }, includedFiles: ['include/*'] }
    },
  }

  await registry.buildFunctionAndWatchFiles(func)

  t.deepEqual(watchDebouncedSpy.args.at(0)[0], ['myfile', 'include/*'])
})
