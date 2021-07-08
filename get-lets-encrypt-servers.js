/**
MIT License

Copyright (c) 2018 Michiel de Jong

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

const http = require('http')
const https = require('https')
const LE = require('greenlock').LE
const leChallengeFs = require('le-challenge-fs')
const leAcmeCore = require('le-acme-core')
const leStoreBot = require('le-store-certbot')

const LE_ROOT = '~/letsencrypt'
const HTTP_REDIRECT_PORT = 80
const HTTPS_PORT = 443

// This function starts a TLS webserver on HTTPS_PORT, with on-the-fly LetsEncrypt cert registration.
// It also starts a redirect server on HTTP_REDIRECT_PORT, which GreenLock uses for the ACME challenge.
// Certificates and temporary files are stored in LE_ROOT
module.exports = function getLetsEncryptServers (domain, handler, email) {
  if('string'!==typeof email){
    email = `admin@${domain}`;
  }
  let httpServer
  const le = LE.create({
    // server: 'staging',
    server: 'https://acme-v01.api.letsencrypt.org/directory',
    acme: leAcmeCore.ACME.create(),
    store: leStoreBot.create({ configDir: LE_ROOT + '/etc', webrootPath: LE_ROOT + '/var/:hostname' }),
    challenges: { 'http-01': leChallengeFs.create({ webrootPath: LE_ROOT + '/var/:hostname' }) },
    agreeToTerms: function (tosUrl, cb) { cb(null, tosUrl) },
    debug: true
  })
  return new Promise((resolve, reject) => {
    httpServer = http.createServer(le.middleware())
    httpServer.listen(HTTP_REDIRECT_PORT, (err) => {
      if (err) { reject(err) } else { resolve() }
    })
  }).then(() => {
    return le.core.certificates.getAsync({
      email: `${email}`,
      domains: [ domain ]
    })
  }).then(function (certs) {
    if (!certs) {
      throw new Error('Should have acquired certificate for domains.')
    }
    return new Promise((resolve, reject) => {
      const httpsServer = https.createServer({
        key: certs.privkey,
        cert: certs.cert,
        ca: certs.chain
      }, handler)
      httpsServer.listen(HTTPS_PORT, (err) => {
        if (err) { reject(err) } else { resolve([ httpsServer, httpServer ]) }
      })
    })
  })
}
