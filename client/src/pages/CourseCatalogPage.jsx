import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { Search, Filter, RotateCcw, BookOpen, AlertCircle } from 'lucide-react';

export const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // Load distinct categories once
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.courses.getCategories();
        setCategories(['All', ...response.data]);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses with current filters
  useEffect(() => {
    const fetchFilteredCourses = async () => {
      setLoading(true);
      try {
        const response = await api.courses.getAll({
          search,
          category: selectedCategory,
          difficulty: selectedDifficulty
        });
        setCourses(response.data);
      } catch (err) {
        console.error('Failed to load courses:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchFilteredCourses();
    }, 250);

    return () => clearTimeout(debounceTimer);
  }, [search, selectedCategory, selectedDifficulty]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>Course Catalog</h1>
        <p>Explore comprehensive technical courses and expand your development skill set.</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Search Input & Difficulty Dropdown */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search courses by title, keywords, instructor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="catalog-search-input"
                style={{ paddingLeft: '2.75rem' }}
              />
              <Search 
                size={18} 
                style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
              />
            </div>

            <div style={{ width: '200px' }}>
              <select
                className="form-control"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                id="catalog-difficulty-select"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {(search || selectedCategory !== 'All' || selectedDifficulty !== 'All') && (
              <button 
                onClick={handleResetFilters} 
                className="btn btn-secondary btn-sm"
                title="Reset Filters"
                id="btn-reset-filters"
              >
                <RotateCcw size={15} />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginRight: '0.5rem', fontWeight: 600 }}>
              Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{courses.length}</strong> available courses
        </span>
      </div>

      {/* Course Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
          Loading course catalog...
        </div>
      ) : courses.length > 0 ? (
        <div className="grid-3">
          {courses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <AlertCircle size={40} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
          <h3>No courses found</h3>
          <p style={{ maxWidth: '420px', margin: '0.5rem auto 1.5rem' }}>
            We couldn't find any courses matching your filter criteria. Try adjusting your search term or resetting the filters.
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary btn-sm">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
