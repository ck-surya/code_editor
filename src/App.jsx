import { Routes, Route } from 'react-router-dom';
import "./App.css";
import ContestPage from "./pages/ContestPage";
import ProblemPage from "./pages/ProblemPage";
import SubmissionPage from "./pages/SubmissionPage";

function App() {
  return (
    <Routes>
      <Route path="/contest" element={<ContestPage />} />
      <Route path="/problem/:problemId" element={<ProblemPage />} />
      <Route path="/submissions" element={<SubmissionPage />} />
      <Route path="*" element={<ContestPage />} />
    </Routes>
  );
}

export default App;
