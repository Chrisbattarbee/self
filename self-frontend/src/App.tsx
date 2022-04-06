import React from 'react';
import './App.css';
import 'semantic-ui-css/semantic.min.css'
import {CaloriePanel} from "./Calories/CaloriePanel";
import {WorkoutPanel} from "./Workout/WorkoutPanel";
import {HealthPanel} from "./Health/HealthPanel";

interface AppProps {
}

interface AppState {
}


class App extends React.Component<AppProps, AppState> {
    render() {
        return (
            <div style={{display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gridGap: 20}}>
                <CaloriePanel/>
                <div>
                    <WorkoutPanel/>
                    <HealthPanel
                        metricsToUse={["lean_body_mass", "active_energy", "apple_exercise_time", "apple_stand_time", "flights_climbed", "resting_heart_rate", "step_count", "weight_body_mass"]}/>
                </div>
            </div>
        );
    }
}

export default App;
