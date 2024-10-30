import React, {Component} from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import styles from './App.module.css';


import {Globus} from './components/index';
import {Leagues} from './components/index';
import {Teams} from './components/index';
import {International} from './components/index';
import {Live} from './components/index';
class App extends Component{


  render() {
    return(
      <Router>
        <Routes>
          <Route path="/" element={<Globus />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/international" element={<International />} />
          <Route path="/live" element={<Live />} />
        </Routes>
    </Router>
    )
  }
}

export default App;
