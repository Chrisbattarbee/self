import React from 'react';
import logo from './logo.svg';
import './App.css';
import {CalorieService} from '../../self-api/self-api-typescript/src/index';
import {DefaultHttpApiBridge} from "conjure-client";

function App() {
    let bridge: DefaultHttpApiBridge = new DefaultHttpApiBridge({
        baseUrl: "http://self.chrisbattarbee.com",
        userAgent: {
            productName: "self-api-frontend",
            productVersion: "0.0.1"
        }
    });

    let calorieService: CalorieService = new CalorieService(bridge);

    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
