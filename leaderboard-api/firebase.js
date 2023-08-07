const { initializeApp, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

const serviceAccount = require('./certs.json') // need to make your own certs.json file with your own firebase credentials

initializeApp({
    credential: cert(serviceAccount)
})

const db = getFirestore()

module.exports = { db }