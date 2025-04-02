import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QuotaTable from './components/QuotaTable';
import FilterPanel from './components/FilterPanel';
import Header from './components/Header';

function App() {
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableOptions, setAvailableOptions] = useState({
    departments: [],
    statuses: []
  });
  const [filters, setFilters] = useState({
    deptCode: '',
    availability: '',
    grade: '',
    department: 'No Filter',
    status: 'UNDERGRADUATE',
    quotaType: 'No Filter'
  });

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data } = await axios.get('/api/departments');
        // Sort departments alphabetically
        const sortedDepartments = [...data].sort();
        setDepartments(sortedDepartments);
        console.log('Loaded departments:', sortedDepartments);
      } catch (error) {
        console.error('Error fetching departments:', error);
        
        // Fallback departments if API fails
        const fallbackDepts = [
          'DSAI', 'ASIA', 'ASIL', 'ATA', 'HTR', 'AUTO', 'BM', 'BIS', 'CHE', 'CHEM', 
          'STS', 'CE', 'ENGG', 'COGS', 'CSE', 'CET', 'CMPE', 'CEM', 'CCS', 'PRED', 
          'EQE', 'EC', 'ED', 'EE', 'ETM', 'ESC', 'ADEX', 'PA', 'FLED', 'GED', 
          'GPH', 'GR', 'HIST', 'LAT', 'HUM', 'IE', 'INCT', 'INTT', 'LAW', 'LS', 
          'CAU', 'LING', 'TID', 'AD', 'MIS', 'MATH', 'SCED', 'ME', 'MECA', 'BIO', 
          'PHIL', 'PE', 'PHYL', 'PHYS', 'POLS', 'PSY', 'SOC', 'SWE', 'TRM', 'SCO', 
          'TR', 'INT', 'TK', 'AR', 'PER', 'TKF', 'TKL'
        ].sort();
        
        setDepartments(fallbackDepts);
        console.log('Using fallback departments due to API error');
      }
    };

    fetchDepartments();
  }, []);

  // Fetch courses with filters applied directly on the backend
  useEffect(() => {
    const fetchCourses = async () => {
      if (!filters.deptCode) {
        setCourses([]);
        return;
      }
      
      setLoading(true);
      try {
        // Build query parameters 
        const params = {};
        if (filters.availability) params.availability = filters.availability;
        if (filters.grade) params.grade = filters.grade;
        if (filters.department) params.department = filters.department;
        if (filters.status) params.status = filters.status;
        if (filters.quotaType) params.quotaType = filters.quotaType;
        
        console.log('Fetching courses with params:', params);
        
        // Pass filters as query parameters to have backend handle filtering
        const { data } = await axios.get(`/api/quota/${filters.deptCode}`, { params });
        setCourses(data.data);
        setAvailableOptions(data.availableOptions);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply search filter on the frontend if needed
  const handleSearch = (searchTerm) => {
    if (!searchTerm) return;
    
    // This is only needed if you want to add a search box later
    const filtered = courses.filter(course => 
      course.Code.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setCourses(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <main className="container mx-auto py-6 px-4">
        <FilterPanel 
          departments={departments}
          filters={filters}
          onFilterChange={handleFilterChange}
          availableOptions={availableOptions}
        />
        
        <div className="mt-6">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bogazici-blue"></div>
              <p className="text-gray-600 font-medium">Scraping data...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
            </div>
          ) : (
            <QuotaTable courses={courses} />
          )}
        </div>
      </main>
      
      <footer className="bg-bogazici-dark text-white py-4 text-center">
        <p className="text-sm">© 2023 Boğaziçi University Course Quota Tracker</p>
      </footer>
    </div>
  );
}

export default App; 