import { BrowserRouter } from 'react-router-dom'
import NavBar from './components/layout/Navbar'
import './App.css';
import Footer from './components/layout/Footer';

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Footer />
    </BrowserRouter>
  )
}

export default App
