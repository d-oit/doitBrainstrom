import { useState, useEffect } from 'react'
import './styles/App.css'
import { listBuckets } from './services/s3Service'

function App() {
  const [buckets, setBuckets] = useState<AWS.S3.Bucket[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBuckets = async () => {
      try {
        const bucketsData = await listBuckets()
        setBuckets(bucketsData)
      } catch (err) {
        setError('Failed to connect to S3. Please check your credentials.')
        console.error(err)
      }
    }

    fetchBuckets()
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>Mind Map PWA</h1>
        <p>A Progressive Web App for creating mind maps</p>
      </header>
      <main>
        <section>
          <h2>S3 Connection Test</h2>
          {error && <p className="error">{error}</p>}
          {buckets && (
            <div>
              <p>Successfully connected to S3!</p>
              <h3>Available Buckets:</h3>
              <ul>
                {buckets.map((bucket) => (
                  <li key={bucket.Name}>{bucket.Name}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default App
