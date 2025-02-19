import { useState } from 'react'

const API_URL = import.meta.env?.API_URL || 'http://localhost:3030'

function Download () {
    const [fileId, setFileId] = useState('')
    const [integrityResult, setIntegrityResult] = useState<any>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        try {
            setLoading(true)
            const integrityResponse = await (await fetch(API_URL + '/integrity/' + fileId)).json()
            if (!integrityResponse.valid) {
                throw new Error(integrityResponse.error)
            }
            setIntegrityResult(integrityResponse)
            setError('')
        } catch (error) {
            console.log({ error })
            setError(String(error) || 'error')
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <label htmlFor='txid-input'>
                <p>File id:</p>
                <input
                    type="text"
                    placeholder="411d36a493..."
                    value={fileId}
                    className='txid-input'
                    onChange={(e) => setFileId(e.target.value)}
                />
            </label>
            <button onClick={handleSubmit}>Submit</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {integrityResult && (
                <div>
                    <h3>Integrity Result</h3>
                    <p><big>{integrityResult.valid ? 'Valid' : 'Invalid'}</big></p>
                    <p>{`${new Date(integrityResult.time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} on ${new Date(integrityResult.time).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}`}</p>
                    <p>Filehash: {integrityResult.fileHash.slice(0,16)}...</p>
                    <button onClick={() => window.location.href = `${API_URL}/download/${fileId}`}>Download</button>
                </div>
            )}
        </div>
    )
}

export default Download