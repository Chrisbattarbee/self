import React from 'react';
import './App.css';
import {CaloriePanel} from "./CaloriePanel";

interface AppProps {

}

interface AppState {
    totalCalories: number
}

class App extends React.Component<AppProps, AppState> {

    render() {
        return (
            <CaloriePanel />
        );
    }
}

export default App;
