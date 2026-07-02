'use strict'

const fs = require('node:fs')

module.exports.register = function ({ config = {} }) {
  this.once('playbookBuilt', ({ playbook }) => {
    const userDataPath = process.env.SHOWROOM_USER_DATA_FILE || config.path || '/user_data/user_data.yml'
    if (!fs.existsSync(userDataPath)) return

    const userData = parseFlatYaml(fs.readFileSync(userDataPath, 'utf8'))
    if (!userData || typeof userData !== 'object' || Array.isArray(userData)) return

    const logger = this.getLogger('showroom-user-data')
    playbook.asciidoc = playbook.asciidoc || {}
    playbook.asciidoc.attributes = {
      ...(playbook.asciidoc.attributes || {}),
      ...userData,
    }
    logger.info({ file: { path: userDataPath } }, 'merged Showroom user_data into Antora attributes')
  })
}

function parseFlatYaml (input) {
  return input.split(/\r?\n/).reduce((attributes, line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || /^\S[^:]*:\s*$/.test(trimmed)) return attributes

    const separator = line.indexOf(':')
    if (separator === -1) return attributes

    const key = unquoteYamlScalar(line.slice(0, separator).trim())
    if (!key || key.startsWith('-') || key.includes(' ')) return attributes

    const rawValue = line.slice(separator + 1).trim()
    attributes[key] = unquoteYamlScalar(rawValue)
    return attributes
  }, {})
}

function unquoteYamlScalar (value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}
