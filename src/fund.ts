import { Request, Response } from 'express'
import { P2PKH, PrivateKey, SatoshisPerKilobyte, Transaction } from '@bsv/sdk'
import WocClient from './woc'
import dotenv from 'dotenv'
import HashPuzzle from './HashPuzzle'
import db from './db'
import Arc from './arc'
dotenv.config()

const { NETWORK } = process.env

const woc = new WocClient()
woc.setNetwork(NETWORK)

const { FUNDING_WIF } = process.env
const key = PrivateKey.fromWif(FUNDING_WIF)
const address = key.toAddress()

export default async function (req: Request, res: Response) {
  const { number: strNum } = req.params
  const number = parseInt(strNum)

  if (number > 1000) {
    res.send({ error: 'too many outputs, keep it to 1000 max', number })
    return
  }

  // grab the first available utxo
  const utxos = await woc.getUtxos(address)
  const rawtx = await woc.getTx(utxos[0].txid)
  const max = utxos.reduce((a, b) => a + b.satoshis - 1, 0)

  if (max > number) {
    res.send({ error: 'not enough satoshis', number, utxos })
    return 
  }

  // save the secrets
  const secretPairs = []
  for (let i = 0; i < number; i++) {
    const pair = HashPuzzle.generateSecretPair()
    secretPairs.push(pair)
  }

  const sourceTransaction = Transaction.fromHex(rawtx)

  // create a number of utxos abnd presign them
  const tx = new Transaction()
  tx.addInput({
    sourceTransaction,
    sourceOutputIndex: utxos[0].vout,
    unlockingScriptTemplate: new P2PKH().unlock(key)
  })
  for (const pair of secretPairs) {
    tx.addOutput({
      satoshis: 1,
      lockingScript: new HashPuzzle().lock(pair.hash)
    })
  }
  await tx.fee(new SatoshisPerKilobyte(1))
  await tx.sign()

  const initialResponse = await tx.broadcast(Arc)

  const txid = tx.id('hex')
  const rawtxHex = tx.toHex()

  const txDbResponse = await db.collection('txs').insertOne({
    txid,
    rawtx: rawtxHex,
    arc: [initialResponse],
    number,
  })

  const utxosDbResponse = await db.collection('utxos').insertMany(
    tx.outputs.map((output, vout) => ({
      txid,
      vout,
      script: output.lockingScript.toHex(),
      satoshis: 1,
      secret: secretPairs[vout].secret,
    }))
  )

  res.send({ txid, number, txDbResponse, utxosDbResponse })
}