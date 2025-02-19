import { useState, useEffect, createRef } from 'react'
import './App.css'
import { QRCodeSVG } from 'qrcode.react'

const API_URL = import.meta.env?.API_URL || 'http://localhost:3030'

function App() {
    const [fundingInfo, setFundingInfo] = useState({ address: '', balance: 0, tokens: 0 })
    const [loading, setLoading] = useState(true)
    const [tokenNumber, setTokenNumber] = useState(1)

    async function createFunds(tokens: number) {
        try {
            setLoading(true)
            const response = await (await fetch(API_URL + '/fund/' + String(tokens))).json()
            console.log({ response })
            await fetchFundingInfo()
        } catch (error) {
            console.error('Failed to create funds', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchFundingInfo = async () => {
        try {
            setLoading(true)
            const { address, balance, tokens } = await (await fetch(API_URL + '/checkTreasury')).json()
            console.log({ address, balance, tokens })
            setFundingInfo({ address, balance, tokens })
        } catch (error) {
            console.error('Failed to fetch funding info', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchFundingInfo()
    }, [])

    if (loading) {
        return <div>Loading...</div>
    }

    if (!fundingInfo) {
        return <div>Error loading funding info.</div>
    }

    return (
        <div style={{ margin: '2rem', fontFamily: 'Helvetica, sans-serif' }}>
            <h1>Truth Machine</h1>
            <h2>Data Integrity & Timestamping Service</h2>
            <section>
                <h2>Treasury</h2>
                <p>Tokens Ready: <big>{fundingInfo.tokens.toLocaleString()}</big></p>
                <p>Balance at Configured Address: <big>{fundingInfo.balance.toLocaleString()}</big> satoshis</p>
                <p>
                    To top up the balance, make a BSV payment to: <br /><span style={{ fontWeight: 'bold', userSelect: 'all' }}>{fundingInfo.address}</span>
                </p>
                <QRCodeSVG value={fundingInfo.address} />
                <p>
                    To create tokens from the available balance:
                </p>
                <label>
                    <input
                        type='number'
                        min='1'
                        max='1000'
                        className='token-input'
                        value={tokenNumber}
                        onChange={(e) => setTokenNumber(parseInt(e.target.value))}
                    />{' '}
                    tokens
                </label>
                <button onClick={() => createFunds(tokenNumber)}>Create Tokens</button>
            </section>
            <section>
                <h2>Upload File</h2>
                <p>
                    Send data to <code>/upload</code> endpoint to store and timestamp on the BSV
                    Blockchain.
                </p>
                <h2>Download Files</h2>
                <p>
                    Retrieve stored data from <code>/download/&lt;hash&gt;</code> along with an
                    integrity proof and timestamp.
                </p>
            </section>
            
        </div>
    )
}

export default App
