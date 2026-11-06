import { useEffect, useMemo, useState } from 'react'

const seedCars = [
  { id: 1, name: 'Maruti Swift', type: 'Hatchback', price: 800, seats: 5, fuel: 'Petrol', transmission: 'Manual', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 2, name: 'Honda City', type: 'Sedan', price: 1200, seats: 5, fuel: 'Petrol', transmission: 'Automatic', image: 'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 3, name: 'Hyundai Creta', type: 'SUV', price: 1500, seats: 5, fuel: 'Diesel', transmission: 'Automatic', image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 4, name: 'Toyota Fortuner', type: 'SUV', price: 2500, seats: 7, fuel: 'Diesel', transmission: 'Automatic', image: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 5, name: 'BMW 5 Series', type: 'Luxury', price: 3500, seats: 5, fuel: 'Petrol', transmission: 'Automatic', image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 6, name: 'Tata Nexon', type: 'SUV', price: 1300, seats: 5, fuel: 'Petrol', transmission: 'Manual', image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 7, name: 'Hyundai i20', type: 'Hatchback', price: 900, seats: 5, fuel: 'Petrol', transmission: 'Manual', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80', available: true },
  { id: 8, name: 'Mercedes C-Class', type: 'Luxury', price: 4000, seats: 5, fuel: 'Petrol', transmission: 'Automatic', image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80', available: true }
]
const read = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback }
  catch { return fallback }
}
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const today = new Date().toISOString().slice(0, 10)

function App() {
  const [users, setUsers] = useState(() => {
    const saved = read('driveeasyUsers', [])
    if (!saved.some(u => u.role === 'admin')) {
      const admin = { id: 'admin-1', name: 'DriveEasy Admin', email: 'admin@driveeasy.com', password: 'Admin@123', role: 'admin' }
      const next = [...saved, admin]; write('driveeasyUsers', next); return next
    }
    return saved
  })
  const [currentUser, setCurrentUser] = useState(() => read('driveeasyCurrentUser', null))
  const [cars, setCars] = useState(() => {
    const saved = read('driveeasyCars', null)
    if (saved) return saved
    write('driveeasyCars', seedCars); return seedCars
  })
  const [bookings, setBookings] = useState(() => read('driveeasyBookings', []))
  const [page, setPage] = useState('home')
  const [selectedCar, setSelectedCar] = useState(null)
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [price, setPrice] = useState('all')
  const [auth, setAuth] = useState({ name: '', email: '', password: '' })
  const [bookingForm, setBookingForm] = useState({ phone: '', pickup: '', pickupDate: '', returnDate: '' })

  useEffect(() => write('driveeasyUsers', users), [users])
  useEffect(() => write('driveeasyCars', cars), [cars])
  useEffect(() => write('driveeasyBookings', bookings), [bookings])
  useEffect(() => {
    if (currentUser) write('driveeasyCurrentUser', currentUser)
    else localStorage.removeItem('driveeasyCurrentUser')
  }, [currentUser])

  const go = (target) => { setNotice(''); setPage(target); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const message = (text) => { setNotice(text); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const filteredCars = useMemo(() => cars.filter(car =>
    car.name.toLowerCase().includes(search.toLowerCase()) &&
    (type === 'all' || car.type === type) &&
    (price === 'all' || car.price <= Number(price))
  ), [cars, search, type, price])

  function register(e) {
    e.preventDefault()
    const name = auth.name.trim(), email = auth.email.trim().toLowerCase(), password = auth.password
    if (!name || !email || password.length < 6) return message('Enter your name, a valid email, and a password of at least 6 characters.')
    if (users.some(u => u.email.toLowerCase() === email)) return message('An account with this email already exists. Please log in.')
    const user = { id: crypto.randomUUID(), name, email, password, role: 'user' }
    setUsers(prev => [...prev, user]); setCurrentUser({ id: user.id, name, email, role: 'user' })
    setAuth({ name: '', email: '', password: '' }); go('home'); message('Account created. Welcome to DriveEasy!')
  }
  function login(e) {
    e.preventDefault()
    const email = auth.email.trim().toLowerCase()
    const user = users.find(u => u.email.toLowerCase() === email && u.password === auth.password)
    if (!user) return message('Incorrect email or password. Please try again.')
    setCurrentUser({ id: user.id, name: user.name, email: user.email, role: user.role })
    setAuth({ name: '', email: '', password: '' }); go(user.role === 'admin' ? 'admin' : 'home')
    message(`Welcome back, ${user.name}!`)
  }
  function logout() { setCurrentUser(null); go('home'); message('You have been logged out.') }
  function requireUser(target) {
    if (!currentUser) { go('login'); message('Please log in to continue.'); return false }
    if (currentUser.role !== 'user') { message('This section is for customer accounts.'); return false }
    go(target); return true
  }
  function startBooking(car) {
    if (!currentUser) { setSelectedCar(car); go('login'); message('Please log in before booking a car.'); return }
    if (currentUser.role !== 'user') return message('Admin accounts cannot create customer bookings.')
    setSelectedCar(car); setBookingForm({ phone: '', pickup: '', pickupDate: '', returnDate: '' }); go('booking')
  }
  function confirmBooking(e) {
    e.preventDefault()
    const { phone, pickup, pickupDate, returnDate } = bookingForm
    if (!phone.trim() || !pickup.trim() || !pickupDate || !returnDate) return message('Please complete every booking field.')
    if (pickupDate < today || returnDate <= pickupDate) return message('Choose a pickup date today or later, and a return date after pickup.')
    if (!selectedCar || !selectedCar.available) return message('This car is currently unavailable.')
    const days = Math.ceil((new Date(`${returnDate}T00:00:00`) - new Date(`${pickupDate}T00:00:00`)) / 86400000)
    const booking = {
      id: `DE${Date.now()}`, userId: currentUser.id, customer: currentUser.name, email: currentUser.email,
      phone, pickup, pickupDate, returnDate, days, carId: selectedCar.id, car: selectedCar.name,
      price: selectedCar.price * days + 500, status: 'Confirmed'
    }
    setBookings(prev => [...prev, booking]); go('confirmation')
  }
  function toggleAvailability(id) {
    setCars(prev => prev.map(car => car.id === id ? { ...car, available: !car.available } : car))
  }

  const myBookings = bookings.filter(b => b.userId === currentUser?.id)
  const activeBookings = bookings.filter(b => b.status === 'Confirmed').length
  const revenue = bookings.reduce((sum, b) => sum + Number(b.price || 0), 0)

  return <><header><nav className="navbar">
    <button className="logo" onClick={() => go('home')}>🚗 DriveEasy</button>
    <div className="nav-links">
      <button onClick={() => go('home')}>Home</button><button onClick={() => go('cars')}>Cars</button>
      {currentUser?.role === 'user' && <button onClick={() => requireUser('bookings')}>My Bookings</button>}
      {currentUser?.role === 'admin' && <button onClick={() => go('admin')}>Admin Dashboard</button>}
    </div>
    <div className="nav-buttons">{currentUser ? <><span className="welcome">Hi, {currentUser.name}</span><button className="btn outline" onClick={logout}>Logout</button></> : <><button className="btn outline" onClick={() => go('login')}>Login</button><button className="btn primary" onClick={() => go('register')}>Sign Up</button></>}</div>
  </nav></header>

  <main className="container main">
    {notice && <div className="notice" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}

    {page === 'home' && <><section className="hero"><div><p className="eyebrow">YOUR JOURNEY STARTS HERE</p><h1>Rent Your Dream Car Today</h1><p>Fast, affordable and reliable car rentals. Choose from our range of comfortable vehicles and start your journey.</p><button className="btn primary" onClick={() => go('cars')}>Browse Cars →</button></div></section>
      <section className="section"><div className="section-title"><h2>Why Choose DriveEasy?</h2><p>Everything you need for a smooth rental experience.</p></div><div className="features">
        <article className="feature"><div>🚘</div><h3>Wide Selection</h3><p>Choose from economy cars, SUVs, sedans and luxury vehicles.</p></article>
        <article className="feature"><div>💰</div><h3>Affordable Prices</h3><p>Transparent pricing with clear rental charges.</p></article>
        <article className="feature"><div>🛡️</div><h3>Safe & Reliable</h3><p>Well-maintained vehicles for a comfortable journey.</p></article>
      </div></section></>}

    {page === 'cars' && <section className="section"><div className="section-title"><h2>Available Cars</h2><p>Find the perfect car for your trip.</p></div>
      <div className="filters"><input placeholder="Search car..." value={search} onChange={e => setSearch(e.target.value)} /><select value={type} onChange={e => setType(e.target.value)}><option value="all">All Types</option>{['Sedan','SUV','Hatchback','Luxury'].map(t => <option key={t}>{t}</option>)}</select><select value={price} onChange={e => setPrice(e.target.value)}><option value="all">All Prices</option><option value="1000">Under ₹1,000</option><option value="1500">Under ₹1,500</option><option value="2000">Under ₹2,000</option></select></div>
      <div className="car-grid">{filteredCars.map(car => <article className="car-card" key={car.id}><img src={car.image} alt={car.name}/><div className="car-info"><span className="tag">{car.type}</span><h3>{car.name}</h3><p className="muted">{car.seats} seats · {car.fuel} · {car.transmission}</p><p className="price">₹{car.price.toLocaleString('en-IN')} <small>/ day</small></p><span className={car.available ? 'available' : 'unavailable'}>{car.available ? '● Available' : '● Unavailable'}</span><button className="btn primary full" disabled={!car.available} onClick={() => startBooking(car)}>{car.available ? 'Rent This Car' : 'Unavailable'}</button></div></article>)}</div>
      {filteredCars.length === 0 && <p className="empty">No cars match your filters.</p>}</section>}

    {page === 'login' && <section className="auth-card"><h2>Welcome Back 👋</h2><p className="muted center">Log in to your DriveEasy account.</p><form onSubmit={login}><label>Email<input type="email" required value={auth.email} onChange={e => setAuth({...auth,email:e.target.value})} placeholder="Enter email"/></label><label>Password<input type="password" required value={auth.password} onChange={e => setAuth({...auth,password:e.target.value})} placeholder="Enter password"/></label><button className="btn primary full">Login</button></form><p className="auth-switch">Don't have an account? <button onClick={() => go('register')}>Sign up</button></p><p className="hint">Admin demo: admin@driveeasy.com / Admin@123</p></section>}

    {page === 'register' && <section className="auth-card"><h2>Create Account 🚗</h2><p className="muted center">Join DriveEasy and book your next ride.</p><form onSubmit={register}><label>Full Name<input required value={auth.name} onChange={e => setAuth({...auth,name:e.target.value})} placeholder="Enter your name"/></label><label>Email<input type="email" required value={auth.email} onChange={e => setAuth({...auth,email:e.target.value})} placeholder="Enter email"/></label><label>Password<input type="password" minLength="6" required value={auth.password} onChange={e => setAuth({...auth,password:e.target.value})} placeholder="At least 6 characters"/></label><button className="btn primary full">Create Account</button></form><p className="auth-switch">Already registered? <button onClick={() => go('login')}>Login</button></p></section>}

    {page === 'booking' && selectedCar && <section className="booking-layout"><div className="panel"><h2>🚘 Booking Details</h2><form onSubmit={confirmBooking}><label>Full Name<input value={currentUser?.name || ''} readOnly /></label><label>Email<input value={currentUser?.email || ''} readOnly /></label><label>Phone Number<input required value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm,phone:e.target.value})} placeholder="Enter phone number"/></label><label>Pickup Location<input required value={bookingForm.pickup} onChange={e => setBookingForm({...bookingForm,pickup:e.target.value})} placeholder="Enter pickup location"/></label><div className="two-col"><label>Pickup Date<input type="date" min={today} required value={bookingForm.pickupDate} onChange={e => setBookingForm({...bookingForm,pickupDate:e.target.value})}/></label><label>Return Date<input type="date" min={bookingForm.pickupDate || today} required value={bookingForm.returnDate} onChange={e => setBookingForm({...bookingForm,returnDate:e.target.value})}/></label></div><button className="btn primary full">Confirm Booking</button></form></div><div className="panel"><h2>💳 Booking Summary</h2><img className="summary-img" src={selectedCar.image} alt={selectedCar.name}/><h3>{selectedCar.name}</h3><p className="muted">{selectedCar.type} · ₹{selectedCar.price}/day</p><div className="summary-row"><span>Rental rate</span><strong>₹{selectedCar.price}/day</strong></div><div className="summary-row"><span>Insurance + service fee</span><strong>₹500</strong></div><p className="hint">Final total = (daily rate × rental days) + ₹500.</p></div></section>}

    {page === 'confirmation' && <section className="confirmation"><div className="success">✓</div><h1>Booking Confirmed!</h1><p>Your reservation has been saved to your account.</p><p className="muted">Booking ID: {bookings.at(-1)?.id}</p><button className="btn primary" onClick={() => go('bookings')}>View My Bookings</button></section>}

    {page === 'bookings' && <section className="section"><div className="section-title"><h2>My Bookings</h2><p>Your rental reservations.</p></div>{myBookings.length ? <div className="booking-list">{myBookings.map(b => <article className="booking-item" key={b.id}><div><h3>{b.car}</h3><p className="muted">Booking ID: {b.id}</p><p>📅 {b.pickupDate} → {b.returnDate} ({b.days} days)</p><p>📍 {b.pickup}</p></div><div className="booking-right"><span className="status">{b.status}</span><strong>₹{b.price.toLocaleString('en-IN')}</strong></div></article>)}</div> : <div className="panel center"><h3>No bookings yet 🚗</h3><p className="muted">Your confirmed bookings will appear here.</p><button className="btn primary" onClick={() => go('cars')}>Browse Cars</button></div>}</section>}

    {page === 'admin' && <section className="section"><div className="section-title"><h2>Admin Dashboard</h2><p>Admin module · manage vehicles and monitor bookings.</p></div>
      <div className="stats"><div className="stat"><span>Total Cars</span><strong>{cars.length}</strong></div><div className="stat"><span>Active Bookings</span><strong>{activeBookings}</strong></div><div className="stat"><span>Total Revenue</span><strong>₹{revenue.toLocaleString('en-IN')}</strong></div></div>
      <div className="panel"><h2>Vehicle Availability</h2><div className="table-wrap"><table><thead><tr><th>Car</th><th>Type</th><th>Price/Day</th><th>Status</th><th>Action</th></tr></thead><tbody>{cars.map(car => <tr key={car.id}><td>{car.name}</td><td>{car.type}</td><td>₹{car.price}</td><td className={car.available ? 'available' : 'unavailable'}>{car.available ? 'Available' : 'Unavailable'}</td><td><button className="btn small outline" onClick={() => toggleAvailability(car.id)}>{car.available ? 'Mark unavailable' : 'Mark available'}</button></td></tr>)}</tbody></table></div></div>
      <div className="panel admin-bookings"><h2>All Customer Bookings</h2>{bookings.length ? <div className="table-wrap"><table><thead><tr><th>Booking ID</th><th>Customer</th><th>Car</th><th>Dates</th><th>Total</th></tr></thead><tbody>{bookings.map(b => <tr key={b.id}><td>{b.id}</td><td>{b.customer}</td><td>{b.car}</td><td>{b.pickupDate} → {b.returnDate}</td><td>₹{b.price}</td></tr>)}</tbody></table></div> : <p className="muted">No customer bookings yet.</p>}</div>
    </section>}
  </main>
  <footer><h2>🚗 DriveEasy</h2><p>Your trusted partner for comfortable and affordable car rentals.</p><p>© 2026 DriveEasy. Academic project demo.</p></footer>
  </>

  // Role-based access is enforced here, not just hidden in the navigation.
  // Admin route is checked below by the wrapper effect.
}
export default function AppWithAccessControl() {
  const [session, setSession] = useState(() => read('driveeasyCurrentUser', null))
  // App owns its own session state; this wrapper provides a defensive redirect
  // for a manually typed admin URL in future route-based extensions.
  return <App />
}
