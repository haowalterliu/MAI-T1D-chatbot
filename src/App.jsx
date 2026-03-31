import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExperimentProvider } from './context/ExperimentContext';
import OnboardingPage from './pages/OnboardingPage';
import SelectionPage from './pages/SelectionPage';
import ResultsPage from './pages/ResultsPage';
import './styles/variables.css';
import './styles/global.css';

function App() {
  return (
    <ExperimentProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/selection" element={<SelectionPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </ExperimentProvider>
  );
}

export default App;
