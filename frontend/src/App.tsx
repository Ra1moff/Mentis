import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { MathBattleSetup } from './pages/MathBattleSetup';
import { MathBattleGame } from './pages/MathBattleGame';
import { MathBattleResult } from './pages/MathBattleResult';
import { MentalArithmeticSetup } from './pages/MentalArithmeticSetup';
import { MentalArithmeticGame } from './pages/MentalArithmeticGame';
import { Leaderboard } from './pages/Leaderboard';
import { Profile } from './pages/Profile';
import { FeedbackForm } from './components/FeedbackForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 flex flex-col justify-start">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/battle" element={<MathBattleSetup />} />
              <Route path="/battle/game" element={<MathBattleGame />} />
              <Route path="/battle/result" element={<MathBattleResult />} />
              <Route path="/mental" element={<MentalArithmeticSetup />} />
              <Route path="/mental/game" element={<MentalArithmeticGame />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
            <FeedbackForm />
          </main>
          <footer className="py-6 text-center text-xs text-game-lightBlue border-t border-game-blue border-opacity-10 mt-auto select-none">
            &copy; {new Date().getFullYear()} MathBattle Arena. Build faster. Pull harder. All rights reserved.
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
