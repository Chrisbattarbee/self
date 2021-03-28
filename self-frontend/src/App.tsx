import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import {CaloriePanel} from "./Calories/CaloriePanel";

interface AppProps {

}

interface AppState {
    totalCalories: number
}

class App extends React.Component<AppProps, AppState> {

    render() {
        return (
            <CaloriePanel/>
        );
    }
}

export default App;
