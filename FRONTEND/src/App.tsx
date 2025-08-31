import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Link, Search, AlertCircle, Star, X, Eye, ShoppingCart, Heart, Filter, Grid, List, Zap, Sparkles, Camera, Globe, TrendingUp, Award, Bookmark, Share2, Download, RefreshCw } from 'lucide-react';
import './App.css';

interface Product {
  name: string;
  category: string;
  imageUrl: string;
  similarityScore: number;
  price?: string;
  rating?: number;
  reviews?: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<Product[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'similarity' | 'name' | 'category'>('similarity');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchProgress, setSearchProgress] = useState<number>(0);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [searchAnimation, setSearchAnimation] = useState<boolean>(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
      setImageLoaded(false);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setImageUrl(event.target.value);
    setPreviewUrl(event.target.value);
    setError('');
    setImageLoaded(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError('');
      setImageLoaded(false);
    }
  };

  const handleTabSwitch = (tab: 'upload' | 'url') => {
    setActiveTab(tab);
    setError('');
    setSelectedFile(null);
    setImageUrl('');
    setPreviewUrl('');
  };

  const clearInput = () => {
    setSelectedFile(null);
    setImageUrl('');
    setPreviewUrl('');
    setError('');
    setImageLoaded(false);
    setImageLoaded(false);
  };

  const simulateProgress = () => {
    setSearchProgress(0);
    const interval = setInterval(() => {
      setSearchProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
    return interval;
  };

  const handleFindSimilarProducts = async () => {
    setLoading(true);
    setIsSearching(true);
    setSearchAnimation(true);
    setError('');
    setResults([]);
    
    const progressInterval = simulateProgress();

    try {
      let response;

      if (activeTab === 'upload') {
        if (!selectedFile) {
          setError('Please select an image file.');
          setLoading(false);
          clearInterval(progressInterval);
          return;
        }

        const formData = new FormData();
        formData.append('image', selectedFile);

        response = await axios.post('http://localhost:5000/api/find-similar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        if (!imageUrl.trim()) {
          setError('Please enter an image URL.');
          setLoading(false);
          clearInterval(progressInterval);
          return;
        }

        response = await axios.post('http://localhost:5000/api/find-similar', {
          imageUrl: imageUrl.trim(),
        }, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }

      // Simulate enhanced product data
      const enhancedResults = response.data.map((product: Product, index: number) => ({
        ...product,
        price: `$${(Math.random() * 200 + 20).toFixed(2)}`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        reviews: Math.floor(Math.random() * 1000 + 50)
      }));
      
      clearInterval(progressInterval);
      setSearchProgress(100);
      
      setTimeout(() => {
        setResults(enhancedResults);
        setSearchProgress(0);
        setIsSearching(false);
        setSearchAnimation(false);
      }, 500);
      
    } catch (err) {
      setError('Error: Could not fetch results. Please try again.');
      console.error('API Error:', err);
      clearInterval(progressInterval);
      setSearchProgress(0);
      setIsSearching(false);
      setSearchAnimation(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (index: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(index)) {
      newFavorites.delete(index);
    } else {
      newFavorites.add(index);
    }
    setFavorites(newFavorites);
  };

  const getFilteredAndSortedResults = () => {
    let filtered = results;
    
    if (filterCategory !== 'all') {
      filtered = results.filter(product => 
        product.category.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'similarity':
          return b.similarityScore - a.similarityScore;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'category':
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });
  };

  const getUniqueCategories = () => {
    const categories = results.map(product => product.category);
    return ['all', ...Array.from(new Set(categories))];
  };

  const formatSimilarityScore = (score: number) => {
    return `${Math.round(score * 100)}%`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  return (
    <div className="app">
      <div className="background-animation">
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>
      
      <div className="container">
        <header className="header">
          <div className="title-container">
            <div className="icon-wrapper">
              <Sparkles className="title-icon sparkle-left" size={48} />
            </div>
            <div className="title-wrapper">
              <h1 className="title">Visual Product Matcher</h1>
              <div className="title-underline"></div>
            </div>
            <div className="icon-wrapper">
              <Zap className="title-icon zap-right" size={48} />
            </div>
          </div>
          <p className="subtitle">
            <span className="subtitle-highlight">AI-Powered</span> Visual Search Technology
          </p>
          <div className="feature-badges">
            <span className="badge">
              <Camera size={16} />
              Image Recognition
            </span>
            <span className="badge">
              <TrendingUp size={16} />
              Smart Matching
            </span>
            <span className="badge">
              <Award size={16} />
              Premium Results
            </span>
          </div>
        </header>

        <div className={`uploader-section ${searchAnimation ? 'searching' : ''}`}>
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'upload' ? 'tab-active' : ''}`}
              onClick={() => handleTabSwitch('upload')}
            >
              <div className="tab-icon">
                <Upload size={20} />
              </div>
              Upload Image
              <div className="tab-indicator"></div>
            </button>
            <button
              className={`tab ${activeTab === 'url' ? 'tab-active' : ''}`}
              onClick={() => handleTabSwitch('url')}
            >
              <div className="tab-icon">
                <Globe size={20} />
              </div>
              Image URL
              <div className="tab-indicator"></div>
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'upload' ? (
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewUrl && (
                  <div className="image-preview">
                    <div className="image-container">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className={`preview-image ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                      />
                      <div className="image-overlay-effects">
                        <div className="scan-line"></div>
                      </div>
                    </div>
                    <button onClick={clearInput} className="clear-preview pulse">
                      <X size={16} />
                    </button>
                    <div className="image-info">
                      <span className="file-name">{selectedFile?.name || 'Image from URL'}</span>
                      <span className="file-size">
                        {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'External'}
                      </span>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-label">
                  <div className="upload-icon-container">
                    <Upload size={40} className="upload-icon" />
                    <div className="upload-pulse"></div>
                  </div>
                  <div className="upload-text">
                    <span className="upload-title">
                      {selectedFile ? selectedFile.name : 'Drop your image here or click to browse'}
                    </span>
                    <span className="file-hint">PNG, JPG, GIF up to 10MB • Drag & Drop supported</span>
                  </div>
                </label>
              </div>
            ) : (
              <div className="url-input-container">
                {previewUrl && (
                  <div className="image-preview">
                    <div className="image-container">
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className={`preview-image ${imageLoaded ? 'loaded' : ''}`}
                        onLoad={() => setImageLoaded(true)}
                      />
                      <div className="image-overlay-effects">
                        <div className="scan-line"></div>
                      </div>
                    </div>
                    <button onClick={clearInput} className="clear-preview pulse">
                      <X size={16} />
                    </button>
                    <div className="image-info">
                      <span className="file-name">Image from URL</span>
                      <span className="file-size">External Source</span>
                    </div>
                  </div>
                )}
                <div className="url-input-wrapper">
                  <div className="input-icon">
                    <Globe size={20} />
                  </div>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={handleUrlChange}
                    placeholder="https://example.com/image.jpg"
                    className="url-input"
                  />
                  <div className="input-border"></div>
                </div>
              </div>
            )}
          </div>

          {(loading || isSearching) && searchProgress > 0 && (
            <div className="progress-container">
              <div className="progress-header">
                <div className="progress-icon">
                  <RefreshCw size={20} className="spinning" />
                </div>
                <span className="progress-label">Analyzing with AI</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${searchProgress}%` }}
                >
                  <div className="progress-shine"></div>
                </div>
              </div>
              <div className="progress-details">
                <span className="progress-text">Processing visual features...</span>
                <span className="progress-percentage">{Math.round(searchProgress)}%</span>
              </div>
            </div>
          )}

          <button
            onClick={handleFindSimilarProducts}
            disabled={loading || (activeTab === 'upload' && !selectedFile) || (activeTab === 'url' && !imageUrl.trim())}
            className={`search-button ${loading ? 'loading' : ''}`}
          >
            <div className="button-content">
              <div className="button-icon">
                {loading ? (
                  <RefreshCw size={24} className="spinning" />
                ) : (
                  <Search size={24} />
                )}
              </div>
              <span className="button-text">
                {loading ? 'Searching Products...' : 'Find Similar Products'}
              </span>
            </div>
            <div className="button-shine"></div>
          </button>

          {error && (
            <div className="error-message">
              <div className="error-icon">
                <AlertCircle size={24} />
              </div>
              <div className="error-content">
                <span className="error-title">Oops! Something went wrong</span>
                <span className="error-text">{error}</span>
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <div className="results-title-container">
                <h2 className="results-title">
                  <Sparkles size={28} className="results-icon" />
                  Similar Products Found
                </h2>
                <div className="results-count">
                  {getFilteredAndSortedResults().length} matches
                </div>
              </div>
              
              <div className="results-controls">
                <div className="view-controls">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Grid size={18} />
                    <span>Grid</span>
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <List size={18} />
                    <span>List</span>
                  </button>
                </div>
                
                <div className="select-wrapper">
                  <Filter size={16} className="select-icon" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="sort-select"
                  >
                    <option value="similarity">Sort by Similarity</option>
                    <option value="name">Sort by Name</option>
                    <option value="category">Sort by Category</option>
                  </select>
                </div>
                
                <div className="select-wrapper">
                  <TrendingUp size={16} className="select-icon" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                  >
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className={`products-container ${viewMode}`}>
              {getFilteredAndSortedResults().map((product, index) => (
                <div 
                  key={index} 
                  className={`product-card ${viewMode}`}
                  onClick={() => setSelectedProduct(product)}
                  onMouseEnter={() => setHoveredCard(index)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <div className="product-image-container">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                      }}
                    />
                    <div className="image-gradient"></div>
                    <div className="image-overlay">
                      <div className="overlay-actions">
                        <button 
                          className="overlay-btn view-btn-overlay"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          title="Quick View"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          className={`overlay-btn favorite-btn ${favorites.has(index) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(index);
                          }}
                          title="Add to Favorites"
                        >
                          <Heart size={18} />
                        </button>
                        <button 
                          className="overlay-btn share-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          title="Share Product"
                        >
                          <Share2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="similarity-badge">
                      <div className="badge-icon">
                        <Star size={14} />
                      </div>
                      <span className="badge-text">
                        {formatSimilarityScore(product.similarityScore)}
                      </span>
                      <div className="badge-shine"></div>
                    </div>
                    {favorites.has(index) && (
                      <div className="favorite-indicator">
                        <Heart size={16} />
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <div className="product-header">
                      <h3 className="product-name">{product.name}</h3>
                      <button 
                        className="bookmark-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(index);
                        }}
                      >
                        <Bookmark size={16} className={favorites.has(index) ? 'bookmarked' : ''} />
                      </button>
                    </div>
                    <p className="product-category">{product.category}</p>
                    {product.price && (
                      <div className="price-container">
                        <span className="product-price">{product.price}</span>
                        <span className="price-badge">Best Match</span>
                      </div>
                    )}
                    {product.rating && (
                      <div className="product-rating">
                        <div className="stars">
                          {renderStars(product.rating)}
                        </div>
                        <span className="rating-text">
                          {product.rating} ({product.reviews} reviews)
                        </span>
                      </div>
                    )}
                    <div className="product-actions">
                      <button className="add-to-cart-btn primary">
                        <ShoppingCart size={18} />
                        <span>Add to Cart</span>
                        <div className="btn-shine"></div>
                      </button>
                      <button className="quick-view-btn secondary">
                        <Eye size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {selectedProduct && (
          <div className="modal-overlay animate-in" onClick={() => setSelectedProduct(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button 
                className="modal-close"
                onClick={() => setSelectedProduct(null)}
              >
                <X size={24} />
              </button>
              <div className="modal-header">
                <div className="modal-badges">
                  <span className="modal-badge premium">
                    <Award size={16} />
                    Premium Match
                  </span>
                  <span className="modal-badge similarity">
                    <Star size={16} />
                    {formatSimilarityScore(selectedProduct.similarityScore)}
                  </span>
                </div>
              </div>
              <div className="modal-body">
                <div className="modal-image">
                  <div className="modal-image-container">
                    <img src={selectedProduct.imageUrl} alt={selectedProduct.name} />
                    <div className="modal-image-overlay">
                      <button className="modal-action-btn">
                        <Download size={20} />
                      </button>
                      <button className="modal-action-btn">
                        <Share2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-details">
                  <div className="modal-title-section">
                    <h2 className="modal-title">{selectedProduct.name}</h2>
                    <button className="modal-favorite-btn">
                      <Heart size={24} />
                    </button>
                  </div>
                  <p className="modal-category">{selectedProduct.category}</p>
                  {selectedProduct.price && (
                    <div className="modal-price-section">
                      <span className="modal-price">{selectedProduct.price}</span>
                      <span className="price-label">Best Price Match</span>
                    </div>
                  )}
                  {selectedProduct.rating && (
                    <div className="modal-rating">
                      <div className="stars">
                        {renderStars(selectedProduct.rating)}
                      </div>
                      <span>{selectedProduct.rating} ({selectedProduct.reviews} reviews)</span>
                    </div>
                  )}
                  <div className="modal-actions">
                    <button className="modal-cart-btn primary">
                      <ShoppingCart size={20} />
                      <span>Add to Cart</span>
                      <div className="btn-ripple"></div>
                    </button>
                    <button className="modal-cart-btn secondary">
                      <Bookmark size={20} />
                      <span>Save for Later</span>
                    </button>
                  </div>
                  <div className="modal-features">
                    <div className="feature-item">
                      <TrendingUp size={16} />
                      <span>AI-Powered Match</span>
                    </div>
                    <div className="feature-item">
                      <Award size={16} />
                      <span>Premium Quality</span>
                    </div>
                    <div className="feature-item">
                      <Star size={16} />
                      <span>Top Rated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;