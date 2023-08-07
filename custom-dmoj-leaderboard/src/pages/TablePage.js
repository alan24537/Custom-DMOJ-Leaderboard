import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './TablePage.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';


export default function TablePage() {
  const URL = 'https://custom-dmoj-leaderboard-api.onrender.com'; //http://localhost:5000
  // const URL ='http://localhost:5000';
  // const URL = 'https://dmoj-leader-api.onrender.com';
  const { tableId } = useParams();
  const [tableData, setTableData] = useState({ header_row: [] , rows: []}); // Initialize with an empty header_row array
  const [mode, setMode] = useState('light');

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

  async function getTableData(){
    console.log("Getting table data")
    const url = URL+'/gettable';
    const body = {
      "id": tableId,
    }
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body), // Convert the data to JSON format
    })
      .then(response => response.json())
      .then(data => {
        setTableData(data);
        console.log(data);
      })
      .catch(error => console.error('Error fetching table data:', error));
  }

  useEffect(() => {
    let ignore = false;
    
    if (!ignore) {
      getTableData();
    }
    return () => { ignore = true; }
  },[]);

  // getTableData();

  return (
    <div class={mode === 'dark' ? 'dark' : 'light'}>
      <div id='background'></div>
          
        <h1 class='title glass'>{tableId}</h1>
          <button class='glass btn' onClick={getTableData}>Reload</button>
          <table class="homework-table glass">
            <thead>
              <tr>
                {tableData["header_row"].map((title, index) => (
                  <th class='table-title' key={index}>
                    {((index < 2) || (index === tableData["header_row"].length-1)) ? title: <a class='table-entry'href={'https://www.dmoj.ca/problem/'+title}>{title}</a>}
                  </th>
                ))}
              </tr>
            </thead>
            {/* Render table body and other parts here */}
            <tbody>
              {tableData["rows"].map((row, index) => (
                
                <tr class={'table-box ' + (index%2 === 0 ? 'glass1': 'glass2')} key={index}>
                  {row.map((cell, index) => (
                    <td key={index}>
                      {
                        index !== 1 ? index !== 0 ? index !== row.length - 1 ? cell+'/100': cell+`/${100*(row.length - 3)}` : cell : <a href={'https://www.dmoj.ca/user/'+cell}>{cell}</a>
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
      {Toggle()}
      <a class='glass admin-btn' href='/'>
        Home Page
      </a>
    </div>
  );
}
