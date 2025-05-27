import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import MenteeAcc from "./MenteeAcc";
import Admin from "../../../backend/src/models/Admin";

const MenteeAccordion = ({ mentees, onFilterChange }) => {
  const user = JSON.parse(localStorage.getItem('adminData'));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [selectedDomain, setSelectedDomain] = useState(`${user.domain}`);
  
  // Extract unique domains from mentees
  const domains = useMemo(() => {
    const uniqueDomains = [...new Set(mentees.map(mentee => mentee.domain))];
    return uniqueDomains.sort();
  }, [mentees]);
  
  // Apply filters and sorting
  const filteredMentees = useMemo(() => {
    return mentees.filter(mentee => {
      const matchesSearch = 
        mentee.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mentee.id.toString().includes(searchTerm.toLowerCase());
      
      const matchesDomain = selectedDomain === '' || mentee.domain === selectedDomain;
      
      return matchesSearch && matchesDomain;
    });
  }, [mentees, searchTerm, selectedDomain]);
  
  const sortedMentees = useMemo(() => {
    return [...filteredMentees].sort((a, b) => {
      switch(sortOrder) {
        case 'name-asc':
          return a.fullname.localeCompare(b.fullname);
        case 'name-desc':
          return b.fullname.localeCompare(a.fullname);
        case 'id-asc':
          return a.id - b.id;
        case 'id-desc':
          return b.id - a.id;
        case 'tasks-desc':
          return (b.taskAssign?.length || 0) - (a.taskAssign?.length || 0);
        case 'completed-desc':
          return (b.taskDone?.length || 0) - (a.taskDone?.length || 0);
        case 'domain-asc':
          return a.domain.localeCompare(b.domain);
        default:
          return 0;
      }
    });
  }, [filteredMentees, sortOrder]);

  // Emit filtered mentees whenever they change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(sortedMentees);
    }
  }, [sortedMentees, onFilterChange]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDomain('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Filter and Search Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Filter Mentees</h3>
        
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search input */}
          <div className="relative flex">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 outline-none sm:text-sm"
            />
          </div>
          
          {/* Domain filter */}
          <div className="relative">
            <label htmlFor="domain-filter" className="mb-1 block text-xs font-medium text-gray-500">
              Domain
            </label>
            <select
              id="domain-filter"
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="">All Domains</option>
              {domains.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
          </div>
          
          {/* Sort options */}
          <div className="relative">
            <label htmlFor="sort-order" className="mb-1 block text-xs font-medium text-gray-500">
              Sort By
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="id-asc">ID (Ascending)</option>
              <option value="id-desc">ID (Descending)</option>
              <option value="domain-asc">Domain</option>
              <option value="tasks-desc">Most Assigned Tasks</option>
              <option value="completed-desc">Most Completed Tasks</option>
            </select>
          </div>
          
          {/* Clear filters button - only visible when filters are applied */}
          {(searchTerm || selectedDomain) && (
            <motion.div 
              className="flex items-end"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <button
                onClick={clearFilters}
                type="button"
                className="flex w-full items-center justify-center gap-1.5 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
        
        {/* Filter stats */}
        <div className="mt-2 flex items-center justify-between text-sm">
          <p className="text-gray-500">
            <span className="font-medium text-gray-900">{sortedMentees.length}</span> 
            {sortedMentees.length === 1 ? ' mentee' : ' mentees'} found
          </p>
          
          {/* Active filters */}
          <div className="flex flex-wrap items-center gap-2">
            {selectedDomain && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Domain: {selectedDomain}
                <button 
                  type="button"
                  onClick={() => setSelectedDomain('')}
                  className="ml-1 inline-flex items-center rounded-full bg-blue-200 p-0.5 text-blue-800 hover:bg-blue-300"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {searchTerm && (
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                Search: "{searchTerm}"
                <button 
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="ml-1 inline-flex items-center rounded-full bg-blue-200 p-0.5 text-blue-800 hover:bg-blue-300"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Mentee List */}
      <AnimatePresence mode="wait">
        {sortedMentees.length > 0 ? (
          <motion.div 
            key="mentee-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {sortedMentees.map((mentee, index) => (
              <MenteeAcc 
                key={mentee.id} 
                mentee={mentee} 
                index={index} 
                highlightDomain={selectedDomain === mentee.domain && selectedDomain !== ''}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key="no-results"
            className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <FunnelIcon className="mb-3 h-12 w-12 text-gray-400" />
            <p className="text-lg font-medium text-gray-900">No mentees found</p>
            <p className="mt-1 text-sm text-gray-500">
              {selectedDomain 
                ? `No mentees found in the ${selectedDomain} domain.` 
                : searchTerm 
                  ? `No results for "${searchTerm}"` 
                  : 'No mentees are currently available.'
              }
            </p>
            {(searchTerm || selectedDomain) && (
              <button
                onClick={clearFilters}
                className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100"
              >
                Clear all filters
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MenteeAccordion;