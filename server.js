const driver = require('bigchaindb-driver')
const base58 = require('bs58')
const nacl = require('tweetnacl')
const express = require('express')
const path = require('path')
const ejs =   require('ejs')
//create a variable for creating an instance for server
let app = express()

app.use(express.static("public"))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({
    extended: true
}))

app.get('/', (req, res) => {
    res.render('form')
})

app.post('/posted', (req, res)=> {
    var mess = req.body.message
    //create the encryption keys for the user
    const alice = nacl.sign.keyPair()
    var publicKey = base58.encode(new Buffer(alice.publicKey))
    var privateKey = base58.encode(new Buffer(alice.secretKey.slice(0, 32)))
    const conn = new driver.Connection('https://test.bigchaindb.com/api/v1/')
    const tx = driver.Transaction.makeCreateTransaction(
        { message: mess },// part to be stored on blockchain
        {},//this is the meta data},
        [ driver.Transaction.makeOutput(
            driver.Transaction.makeEd25519Condition(publicKey))],
        publicKey)// hashing the data using the keys
    const txSigned = driver.Transaction.signTransaction(tx, privateKey)
    console.log(txSigned)
    conn.postTransactionCommit(txSigned)
    res.json(txSigned)
})

app.listen(8000,()=>{
    console.log('8000')
})