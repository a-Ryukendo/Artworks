

import './App.css'; // Your main app CSS
import ArtworksTable from './components/ArtworksTable'; // Adjust path if needed
import PaginatorTest from './components/PaginatorTest';

function App() {
  return (
    <div className="App">
      <h1>Artworks Data</h1>
      <ArtworksTable />
      <PaginatorTest />
    </div>
  );
}

export default App;