import React from 'react';
import styles from '../css/Start.module.css';

import NavMenu from '../common/NavMenu';
import Globus from '../Globus/start/Globus'

function StartPage(){

    return(

      <div>
        <NavMenu />
        <Globus />
      </div>
      
    )
  }

export default StartPage;
