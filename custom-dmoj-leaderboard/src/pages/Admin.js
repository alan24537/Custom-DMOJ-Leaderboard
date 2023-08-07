import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

import './Admin.css'

import { useState } from "react";
// import Select from 'react-select';

export default function Admin() {
  const URL = 'https://custom-dmoj-leaderboard-api.onrender.com'; //http://localhost:5000
  // const URL ='http://localhost:5000';
  // const URL = 'https://dmoj-leader-api.onrender.com';
  const [loggedIn, setLoggedIn] = useState(false);
  const [logText, setLogText] = useState('');
  const [tableId, setTableId] = useState("");
  const [username, setUsername] = useState("");
  const [problem, setProblem] = useState("");
  const [mode, setMode] = useState('light');

  // Handle changes in the text box
  const handleLogChange = (event) => {
    setLogText(event.target.value);
  };

  // Handle changes in the text box
  const userChange = (event) => {
    setUsername(event.target.value);
  };

  // Handle changes in the text box
  const probChange = (event) => {
    setProblem(event.target.value);
  };

  // Handle changes in the text box
  const tableChange = (event) => {
    setTableId(event.target.value);
  };

  const toggleMode = () => {
    if (mode === 'dark'){
      setMode('light')
    }
    else{
      setMode('dark');
    }
  }

  async function handleLogClick() {
    const url = URL+'/auth';
    const body = {
      "table_id": tableId,
      "password" : logText
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
        if (data["response"] === "GOOD"){
          setLoggedIn(true);
        }
      })
      .catch(error => {
        // Handle any errors
        console.error('Error:', error);
      });
  }

  async function createTable(){
    const url = URL + '/addtable';

    const body = {
      "id": tableId,
      "password": logText
    } 

    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body), // Convert the data to JSON format
    })

    alert('Created table')
  }

  async function addUser(){
    const url = URL+'/addUser';
    const body = {
      "table_id": tableId,
      "username" : username
    }
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body), // Convert the data to JSON format
    })
  }

  async function deleteUser(){
    const url = URL+'/deleteUser';
    const body = {
      "table_id": tableId,
      "username" : username
    }
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body), // Convert the data to JSON format
    })
  }

  async function addProblem(){
    const url = URL+'/addProblem';
    const body = {
      "table_id": tableId,
      "problem" : problem
    }
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body), // Convert the data to JSON format
    })
  }

  async function deleteProblem(){
    const url = URL+'/deleteProblem';
    const body = {
      "table_id": tableId,
      "problem" : problem
    }
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body), // Convert the data to JSON format
    })
  }

  function Auth(){
    return(
      <div>
        <div id= "log-box" class="glass">
          <h1 id='box-title'>
            Admin Log In
          </h1>

          <h2>
            Table ID
          </h2>
          <input
            class='glass text1'
            type="text"
            value={tableId}
            onChange={tableChange}
            placeholder=""
          />

          <h2>
            Password
          </h2>
          <input
            class='glass text1'
            type="text"
            value={logText}
            onChange={handleLogChange}
            placeholder=""
          />

          <button onClick = {handleLogClick} class="glass" id="log-button">
            Click to log in
          </button>
          <button onClick = {createTable} class="glass" id="log-button">
            Click to create table
          </button>
        </div>
      </div>
    );
  }

  function Main(){
    return (
      <div>
        <div id='admin-box'>
          <div class='admin-subbox'>
            <div class='admin-subbox-group'>
              <h1 class='glass section-title'>
                Table ID: {tableId}
              </h1>
              
            </div>
          </div>
          
          <div class='admin-subbox'>
          <div class='admin-subbox-group'>
              <h1 class='glass section-title'>
                Username
              </h1>
              <input
                class = "glass text-box"
                type="text"
                value={username}
                onChange={userChange}
                placeholder=""
              />
            </div>

            <div class='admin-subbox-group'>
              <h1 class='glass section-title'>
                Problem
              </h1>
              <input
                class = "glass text-box"
                type="text"
                value={problem}
                onChange={probChange}
                placeholder=""
              />
            </div>
          </div>

          <div class='admin-subbox'>
            <button class='glass section-title' onClick={addUser}>
              Add User
            </button>

            <button class='glass section-title' onClick={deleteUser}>
              Delete User
            </button>

            <button class='glass section-title' onClick={addProblem}>
              Add Problem
            </button>

            <button class='glass section-title' onClick={deleteProblem}>
              Delete Problem
            </button> 
          </div>


        </div>
          
      </div>
    );
  }

  function Toggle(){
    const icon = mode === 'dark' ? <FontAwesomeIcon icon={faMoon} fontSize='50px'/> : <FontAwesomeIcon icon={faSun} fontSize='50px'/>
    return (
      <button class='glass toggle' onClick={toggleMode}>
        {icon}
      </button>
    );
  }

  function Load(){
    if (loggedIn === false){
      return Auth();
    }
    return Main();
  }

  

  return (
    <>
      <div className={mode === 'dark' ? 'dark' : 'light'}>
        <div id="background"></div>
        {Load()}
        {Toggle()}
        <a class='glass admin-btn' href='/'>
          Home Page
        </a>
      </div>
    </>
  );
}

