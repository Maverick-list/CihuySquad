import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'

import Home from './pages/Home'
import Monitor from './pages/Monitor'

// Pages (to be implemented)
import Energy from './pages/Energy'
import Environment from './pages/Environment'
import Auth from './pages/Auth'

function App() {
    return (
        <Router>
            <MainLayout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/monitor" element={<Monitor />} />
                    <Route path="/energy" element={<Energy />} />
                    <Route path="/environment" element={<Environment />} />
                    <Route path="/auth" element={<Auth />} />
                </Routes>
            </MainLayout>
        </Router>
    )
}

export default App
