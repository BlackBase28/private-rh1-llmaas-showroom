'use strict'

const fs = require('node:fs')
const yaml = require('js-yaml')

module.exports.register = function ({ config = {} }) {
  this.once('playbookBuilt', ({ playbook }) => {
    const userDataPath = process.env.SHOWROOM_USER_DATA_FILE || config.path || '/user_data/user_data.yml'
    if (!fs.existsSync(userDataPath)) return

    const userData = yaml.load(fs.readFileSync(userDataPath, 'utf8')) || {}
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
