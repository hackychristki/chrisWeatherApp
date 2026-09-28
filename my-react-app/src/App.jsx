import { useEffect, useRef, useState } from 'react'

function condition(code) {
  if (code === 0) return ['Clear skies', 'sun']
  if (code <= 2) return ['Partly cloudy', 'sun']
  if (code === 3) return ['Overcast', 'cloud']
  if (code <= 48) return ['Misty skies', 'cloud']
  if ([71, 73, 75, 77, 85, 86].includes(code)) return ['Snowfall', 'snow']
  if (code >= 95) return ['Thunderstorms', 'storm']
  return ['Rainy skies', 'rain']
}

function Icon({ type = 'sun' }) {
  return <svg className="icon" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'sun' && <><circle cx="16" cy="16" r="6" /><path d="M16 2v3m0 22v3M2 16h3m22 0h3M6 6l2 2m16 16 2 2M6 26l2-2M24 8l2-2" /></>}
    {['cloud', 'rain', 'snow', 'storm'].includes(type) && <><path d="M8 22a6 6 0 0 1-1-12 8 8 0 0 1 15-1 6.5 6.5 0 1 1 2 13H8Z" />{type === 'rain' && <path d="m11 26-1 3m7-3-1 3m7-3-1 3" />}{type === 'snow' && <path d="M10 27h.1M17 28h.1M24 27h.1" />}{type === 'storm' && <path d="m18 17-5 9h5l-3 5" />}</>}
    {type === 'wind' && <path d="M3 11h19a4 4 0 1 0-4-4M3 16h24a3 3 0 1 1-3 3M3 22h11a4 4 0 1 1-4 4" />}
    {type === 'drop' && <path d="M16 3S6 14 6 20a10 10 0 0 0 20 0C26 14 16 3 16 3ZM11 20a5 5 0 0 0 5 5" />}
    {type === 'thermometer' && <><path d="M12 20V7a4 4 0 0 1 8 0v13a7 7 0 1 1-8 0Z" /><path d="M16 11v13m9-15h3m-3 5h3" /></>}
    {type === 'search' && <><circle cx="14" cy="14" r="9" /><path d="m21 21 7 7" /></>}
    {type === 'pin' && <><path d="M25 13c0 7-9 16-9 16S7 20 7 13a9 9 0 0 1 18 0Z" /><circle cx="16" cy="13" r="3" /></>}
  </svg>
}

function Landscape() {
  return <svg className="landscape" viewBox="0 0 800 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="sky" x2="0" y2="1"><stop stopColor="#d4e5f7" /><stop offset="1" stopColor="#edf5ff" /></linearGradient><linearGradient id="hill" x2="0" y2="1"><stop stopColor="#5286b9" /><stop offset="1" stopColor="#295c90" /></linearGradient></defs>
    <path fill="url(#sky)" d="M0 0h800v480H0z" />
    <circle cx="565" cy="126" r="57" fill="#ffffff" /><circle cx="565" cy="126" r="76" fill="#ffffff" opacity=".15" />
    <path d="m0 310 150-130 81 64L390 70l177 193 95-96 138 120v193H0Z" fill="#aecae6" />
    <path d="m284 186 106-116 110 120-63-25-39-57-35 54-28-10-24 32Z" fill="#edf5ff" />
    <path d="m420 320 178-154 202 148v166H0V356l148-101 149 100Z" fill="#7ca6d0" />
    <path d="M0 329q170-96 370 41t430-52v162H0Z" fill="url(#hill)" />
    <path d="M0 407q154-111 385-4t415-18v95H0Z" fill="#1c4877" />
    <path d="M460 480q-114-61 2-99-82 27-98 37t24 62" fill="#a3c7e8" opacity=".8" />
    {[54, 90, 119, 685, 720, 751].map((x, i) => <g key={x} transform={`translate(${x} ${315 + (i % 3) * 17})`} fill="#234f7d"><path d="m0-54-18 39h11l-19 28h52L7-15h11Z" /><path d="M-2 0h4v27h-4z" /></g>)}
  </svg>
}

const number = (value) => value == null ? '—' : Math.round(value)

export default function App() {
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const request = useRef(null)

  async function loadWeather(city, initial = false) {
    if (!city.trim()) { setError('Enter a city.'); return }
    request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    if (!initial) {
      setLoading(true)
      setError('')
    }
    try {
      const search = new URLSearchParams({ name: city.trim(), count: '1', language: 'en', format: 'json' })
      const locationResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${search}`, { signal: controller.signal })
      if (!locationResponse.ok) throw new Error('Search unavailable. Try again.')
      const place = (await locationResponse.json()).results?.[0]
      if (!place) throw new Error('City not found.')
      const params = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation,is_day', daily: 'weather_code,temperature_2m_max,temperature_2m_min', timezone: 'auto', forecast_days: '5' })
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal })
      if (!response.ok) throw new Error('Weather unavailable. Try again.')
      const data = await response.json()
      console.log('Weather data:', data)
      setResult({ place, ...data })
    } catch (err) {
      if (err.name !== 'AbortError') setError(err.message)
    } finally {
      if (!controller.signal.aborted) setLoading(false)
    }
  }

  useEffect(() => {
    // This effect synchronizes the initial view with the remote weather API.
    // oxlint-disable-next-line react/set-state-in-effect
    loadWeather('Altstätten', true)
    return () => request.current?.abort()
  }, [])

  const current = result?.current
  const [description, weatherIcon] = current ? condition(current.weather_code) : ['No weather data', 'sun']
  const date = current ? new Date(`${current.time.slice(0, 10)}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) : ''

  return <div className="app-shell">
    {/* <header className="site-header"><a className="brand" href="./"><span className="brand-mark"><Icon /></span> daybreak<span className="brand-dot">.</span></a><span className="unit-badge">°C</span></header> */}
    <main>
      <section className="intro"><h1>Weather</h1></section>
      <section className="search-section" aria-label="Search for a city"><form onSubmit={(event) => { event.preventDefault(); loadWeather(query) }} className="search-form"><Icon type="search" /><label className="sr-only" htmlFor="city-search">Search city</label><input id="city-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search city" autoComplete="off" /><button disabled={loading} type="submit">{loading ? 'Loading…' : 'Search'}<span aria-hidden="true">↗</span></button></form><div className="quick-cities">{['Altstätten', 'Zurich', 'London', 'Tokyo'].map(city => <button key={city} onClick={() => { setQuery(city); loadWeather(city) }} disabled={loading}>{city}<span aria-hidden="true">↗</span></button>)}</div></section>
      {error && <div className="error" role="alert">{error} {result && 'Previous forecast shown.'}<button onClick={() => loadWeather(query || 'Altstätten')}>Retry</button></div>}
      <div className="dashboard" aria-busy={loading}>
        <section className="current-card"><div className="current-info"><div className="card-topline"><span className="eyebrow">NOW</span><span className="live-badge"><i />{loading ? 'Updating' : current ? 'Updated' : 'No data'}</span></div><div className="location"><Icon type="pin" /><span>{result ? `${result.place.name}, ${result.place.country}` : 'Altstätten, Switzerland'}</span></div><p className="date">{date}</p><div className="temperature">{number(current?.temperature_2m)}<span>°</span><span className="temperature-unit">C</span></div><div className="condition"><Icon type={weatherIcon} /><h2>{current?.is_day === 0 && current.weather_code === 0 ? 'Clear night' : description}</h2></div><p className="feels-like">{current ? `High ${number(result.daily.temperature_2m_max[0])}° / Low ${number(result.daily.temperature_2m_min[0])}°` : loading ? 'Loading…' : 'Search a city.'}</p></div><div className="scenery"><Landscape /></div></section>
        <aside className="details-card"><div className="section-heading"><h2>Details</h2></div>{[{ icon: 'thermometer', label: 'Feels like', value: number(current?.apparent_temperature), unit: '°C' }, { icon: 'drop', label: 'Humidity', value: number(current?.relative_humidity_2m), unit: '%' }, { icon: 'wind', label: 'Wind', value: number(current?.wind_speed_10m), unit: 'km/h' }, { icon: 'rain', label: 'Precipitation', value: current?.precipitation ?? '—', unit: 'mm' }].map(item => <div className="detail-row" key={item.label}><span className="detail-icon"><Icon type={item.icon} /></span><div><h3>{item.label}</h3></div><strong>{item.value}<small>{item.unit}</small></strong></div>)}</aside>
        <section className="forecast-card"><div className="section-heading"><h2>5-day forecast</h2></div><div className="forecast-grid">{result ? result.daily.time.map((day, i) => { const [label, icon] = condition(result.daily.weather_code[i]); return <article className={`forecast-day ${i === 0 ? 'today' : ''}`} key={day}><h3>{i === 0 ? 'Today' : new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short' })}</h3><Icon type={icon} /><p>{label}</p><div><strong>{number(result.daily.temperature_2m_max[i])}°</strong><span>{number(result.daily.temperature_2m_min[i])}°</span></div></article> }) : <p className="empty-forecast" role="status">{loading ? 'Loading…' : 'No forecast.'}</p>}</div></section>
      </div>

    </main>
    <footer><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo ↗</a><span>{current ? `Updated ${current.time.slice(11, 16)} · ${result.timezone.replaceAll('_', ' ')}` : ''}</span></footer>
    <div className="sr-only" role="status">{loading ? 'Loading weather' : result ? `Weather loaded for ${result.place.name}` : ''}</div>
  </div>
}
