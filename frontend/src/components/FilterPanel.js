import React, { useState, useRef, useEffect } from 'react';

function FilterPanel({ departments, filters, onFilterChange, availableOptions }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleDepartmentChange = (dept) => {
    onFilterChange('deptCode', dept);
    setIsOpen(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Filter Courses</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Filter Options</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Department Code Filter - Custom Dropdown */}
        <div ref={dropdownRef} className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department Code
          </label>
          <button
            type="button"
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-bogazici-blue focus:border-transparent transition-colors hover:border-bogazici-blue"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className={filters.deptCode ? "text-gray-900" : "text-gray-500"}>
              {filters.deptCode || "Select Department"}
            </span>
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {isOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg border border-gray-300 max-h-60 overflow-y-auto">
              <div className="py-1">
                <button
                  type="button"
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${!filters.deptCode ? 'bg-gray-50 text-bogazici-blue font-medium' : ''}`}
                  onClick={() => handleDepartmentChange('')}
                >
                  Select Department
                </button>
                
                {departments.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${filters.deptCode === dept ? 'bg-gray-50 text-bogazici-blue font-medium' : ''}`}
                    onClick={() => handleDepartmentChange(dept)}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Department Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bogazici-blue focus:border-transparent transition-colors hover:border-bogazici-blue"
            value={filters.department}
            onChange={(e) => onFilterChange('department', e.target.value)}
          >
            <option value="No Filter">No Filter</option>
            {availableOptions.departments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Level
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bogazici-blue focus:border-transparent transition-colors hover:border-bogazici-blue"
            value={filters.status}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="UNDERGRADUATE">Undergraduate</option>
            <option value="OZELLISANS">Özel Lisans</option>
            <option value="PHD">PhD</option>
            <option value="MASTER">Master</option>
            <option value="OZELMASTER">Özel Master</option>
            <option value="OZELPHD">Özel PhD</option>
            <option value="No Filter">No Filter</option>
          </select>
        </div>

        {/* Quota Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quota Type
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bogazici-blue focus:border-transparent transition-colors hover:border-bogazici-blue"
            value={filters.quotaType}
            onChange={(e) => onFilterChange('quotaType', e.target.value)}
          >
            <option value="No Filter">No Filter</option>
            <option value="consent of instructor">Consent of Instructor</option>
            <option value="unlimited">Unlimited</option>
          </select>
        </div>

        {/* Availability Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bogazici-blue focus:border-transparent transition-colors hover:border-bogazici-blue"
            value={filters.availability}
            onChange={(e) => onFilterChange('availability', e.target.value)}
          >
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Full">Full</option>
            <option value="Try to get consent">Try to get consent</option>
          </select>
        </div>

        {/* Grade Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grade Level
          </label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bogazici-blue focus:border-transparent transition-colors hover:border-bogazici-blue"
            value={filters.grade}
            onChange={(e) => onFilterChange('grade', e.target.value)}
          >
            <option value="">All Grades</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel; 