import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

function App() {
  const URL = 'https://custom-dmoj-leaderboard-api.onrender.com'; //http://localhost:5000
  // const URL ='http://localhost:5000';
  // const URL = 'https://dmoj-leader-api.onrender.com';
  const [tableList, setTableList] = useState([]);
  const [mode, setMode] = useState('light');

  useEffect(() => {
    const url = URL+'/alltables';
    fetch(url)
      .then(response => response.json())
      .then(data => setTableList(data.collections))
      .catch(error => console.error('Error fetching collection names:', error));
  }, []);

  const toggleMode = () => {
    if (mode === 'dark'){
      setMode('light')
    }
    else{
      setMode('dark');
    }
  }

  function Toggle(){
    const icon = mode === 'dark' ? <FontAwesomeIcon icon={faMoon} fontSize='50px'/> : <FontAwesomeIcon icon={faSun} fontSize='50px'/>
    return (
      <button class='glass toggle' onClick={toggleMode}>
        {icon}
      </button>
    );
  }
  

  return (
    <div class={mode === 'dark' ? 'dark' : 'light'}>
      <div id='background'></div>
      <div class='flex-column'>
        <h1 class='title glass'>Custom DMOJ Leaderboard</h1>
        <table class="homework-table glass">
          <thead>
            <tr>
              <th class='table-title'>Leaderboard Name</th>
            </tr>
          </thead>
          <tbody>
            {tableList.map((tableName, index) => (
              <tr class={'table-box ' + (index%2 === 0 ? 'glass1': 'glass2')} key={index}>
                <td>
                  <Link class='table-entry' to={`/leaderboard/${tableName}`}>{tableName}</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>  
      </div>

      {Toggle()}
      <a class='glass admin-btn' href='/admin'>
        Admin Page
      </a>
    </div>
  );
}

export default App;
