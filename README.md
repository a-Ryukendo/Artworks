# Artworks Table - React + TypeScript + PrimeReact

A dynamic data table component built with React, TypeScript, and PrimeReact that displays artwork data from the Art Institute of Chicago API with advanced selection features.

## 🎨 Features

### Core Functionality
- **Lazy Loading**: Efficient pagination with API calls only when needed
- **URL Synchronization**: Page state persists in browser URL parameters
- **Responsive Design**: Clean, modern UI with PrimeReact components
- **Real-time Data**: Fetches artwork data from the Art Institute of Chicago API

### Advanced Selection System
- **Elastic Selection**: Maintains a target number of selected items across pages
- **Cross-page Selection**: Automatically fills gaps when items are deselected
- **Bulk Selection**: Select N items with intelligent distribution across pages
- **Selection Persistence**: Selections persist when navigating between pages

### Data Display
- **Artwork Information**: Title, artist, place of origin, inscriptions, dates
- **Sortable Columns**: All columns support sorting functionality
- **Customizable Rows**: Configurable rows per page (12, 25, 50, 100)
- **Loading States**: Smooth loading indicators during data fetching

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PrimeReact
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📋 Usage

### Basic Table
The ArtworksTable component is ready to use out of the box:

```tsx
import ArtworksTable from './components/ArtworksTable';

function App() {
  return (
    <div>
      <ArtworksTable />
    </div>
  );
}
```

### Elastic Selection
1. Click the chevron icon in the table header
2. Enter the number of items you want to select
3. The system will intelligently distribute selections across pages
4. When you deselect items, the system automatically fills gaps from subsequent pages

### Row Click Mode
Toggle the input switch to enable/disable row click selection mode.

## 🏗️ Architecture

### Key Components
- **ArtworksTable**: Main component with lazy loading and selection logic
- **SelectedArtworksPanel**: Displays currently selected artworks
- **OverlayPanel**: Modal for bulk selection input

### State Management
- **Lazy State**: Manages pagination (first, rows, page)
- **Selection State**: Tracks selected items and elastic selection mode
- **Loading State**: Handles API call states and UI feedback

### API Integration
- **Endpoint**: `https://api.artic.edu/api/v1/artworks`
- **Parameters**: `page` and `limit` for pagination
- **Response**: Artwork data with pagination metadata

## 🔧 Technical Details

### Memory Optimization
- ✅ No variable holds all rows from different pages
- ✅ API calls on every page change
- ✅ Efficient lazy loading implementation

### Selection Persistence
- ✅ Selections persist across page navigation
- ✅ Elastic selection maintains target count
- ✅ Cross-page selection management

### Performance Features
- ✅ Lazy loading prevents memory issues
- ✅ URL synchronization for bookmarkable states
- ✅ Optimized re-renders with proper state management

## 🛠️ Development

### Project Structure
```
src/
├── components/
│   └── ArtworksTable.tsx    # Main table component
├── App.tsx                  # Root component
└── main.tsx                # Entry point
```

### Key Dependencies
- **React**: UI framework
- **TypeScript**: Type safety
- **PrimeReact**: UI component library
- **Vite**: Build tool and dev server

### Available Scripts
- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🎯 Requirements Met

This project satisfies all specified requirements:

1. **Memory Management**: No variable holds all rows from different pages
2. **API Efficiency**: Calls API on every page change
3. **Selection Persistence**: Selections persist across different pages
4. **Cross-page Navigation**: Selections maintain when revisiting pages

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or issues, please open an issue in the repository.
