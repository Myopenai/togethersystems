import React, { useState, useEffect } from 'react';
import { enterprises, ceocProfiles, projects } from './models/dataModels';
import { Line, Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  
  // Sample data for charts
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue (€)',
        data: [65000, 59000, 80000, 81000, 92000, 105000],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const projectStatusData = {
    labels: ['Planning', 'In Progress', 'Completed', 'On Hold'],
    datasets: [
      {
        data: [2, 5, 3, 1],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#6B7280']
      }
    ]
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo">
          <h2>UAE Portal</h2>
        </div>
        <nav>
          <button 
            className={activeTab === 'dashboard' ? 'active' : ''}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={activeTab === 'enterprises' ? 'active' : ''}
            onClick={() => setActiveTab('enterprises')}
          >
            🏢 Enterprises
          </button>
          <button 
            className={activeTab === 'ceoc' ? 'active' : ''}
            onClick={() => setActiveTab('ceoc')}
          >
            👥 CEOC Network
          </button>
          <button 
            className={activeTab === 'projects' ? 'active' : ''}
            onClick={() => setActiveTab('projects')}
          >
            📋 Projects
          </button>
        </nav>
        <div className="theme-toggle">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <header>
          <h1>Universe All Enterprises Portal</h1>
          <div className="user-menu">
            <span>👤 Admin User</span>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="dashboard">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Enterprises</h3>
                <p className="stat-number">{enterprises.length}</p>
                <p className="stat-change">+5% from last month</p>
              </div>
              <div className="stat-card">
                <h3>Active CEOCs</h3>
                <p className="stat-number">{ceocProfiles.length}</p>
                <p className="stat-change">+3 new this month</p>
              </div>
              <div className="stat-card">
                <h3>Active Projects</h3>
                <p className="stat-number">{projects.length}</p>
                <p className="stat-change">2 nearing completion</p>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart">
                <h3>Revenue Overview</h3>
                <Line 
                  data={revenueData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </div>
              <div className="chart">
                <h3>Project Status</h3>
                <Pie 
                  data={projectStatusData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right',
                      },
                    },
                  }}
                />
              </div>
            </div>

            <div className="recent-activity">
              <h3>Recent Activity</h3>
              <ul>
                {projects.slice(0, 3).map(project => (
                  <li key={project.id}>
                    <span className="activity-badge">🔄</span>
                    <div>
                      <strong>{project.name}</strong>
                      <p>Status: {project.status} • {project.progress}% complete</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'enterprises' && (
          <div className="data-table">
            <h2>Enterprise Directory</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Industry</th>
                  <th>Location</th>
                  <th>Employees</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {enterprises.map(enterprise => (
                  <tr key={enterprise.id}>
                    <td>{enterprise.name}</td>
                    <td>{enterprise.industry}</td>
                    <td>{enterprise.hq}</td>
                    <td>{enterprise.employees}</td>
                    <td><span className={`status-badge ${enterprise.status.toLowerCase()}`}>
                      {enterprise.status}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Other tabs content would go here */}
      </main>
    </div>
  );
}

export default App;
