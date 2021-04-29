import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import {CaloriePanel} from "./Calories/CaloriePanel";
import {WorkoutPanel} from "./Workout/WorkoutPanel";

interface AppProps { }

interface AppState { }


class App extends React.Component<AppProps, AppState> {
    render() {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: 20 }}>
                <CaloriePanel/>
                <WorkoutPanel/>
            </div>

        );
    }
}

export default App;
