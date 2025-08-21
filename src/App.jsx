import React from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MagazineDetail from "./pages/MagazineDetail";
import Magazine from "./pages/Magazine";
import ScrollToTop from "./components/ScrollToTop";
import LoadingWrapper from "./components/LoadingWrapper";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/magazine/:id" element={
            <LoadingWrapper>
              <MagazineDetail />
            </LoadingWrapper>
          } />
          <Route path="/read/:id" element={
            <LoadingWrapper>
              <Magazine />
            </LoadingWrapper>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
