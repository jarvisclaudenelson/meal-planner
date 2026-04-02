import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import { WeekProvider } from './context/WeekContext'
import Meals from './pages/Meals'
import Sides from './pages/Sides'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import Shopping from './pages/Shopping'

export default function App() {
  return (
    <BrowserRouter>
      <WeekProvider>
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 pb-16">
          <Routes>
            <Route path="/" element={<Navigate to="/meals" replace />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/sides" element={<Sides />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/shopping" element={<Shopping />} />
            {/* Redirects for old bookmarks */}
            <Route path="/today" element={<Navigate to="/meals" replace />} />
            <Route path="/plan" element={<Navigate to="/meals" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
      </WeekProvider>
    </BrowserRouter>
  )
}
