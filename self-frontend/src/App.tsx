import React from 'react';
import logo from './logo.svg';
import './App.css';
import {CalorieService} from "conjure-self-api";
import {DefaultHttpApiBridge} from "conjure-client";

interface AppProps {

}

interface AppState {
    totalCalories: number
}

class App extends React.Component<AppProps, AppState> {

    constructor(props: AppProps) {
        super(props);
        this.state = {totalCalories: 0};
    }

    componentDidMount() {
        let bridge: DefaultHttpApiBridge = new DefaultHttpApiBridge({
            baseUrl: "http://self.chrisbattarbee.com",
            userAgent: {
                productName: "self-api-frontend",
                productVersion: "0.0.1"
            }
        });
        let calorieService: CalorieService = new CalorieService(bridge);
        let mealsForDay = calorieService.getDailyCalories("2021-03-13");
        let totalCalories = mealsForDay.then(x => x.meals.map(x => x.entries.map(y => (y.calories as number)).reduce((y, z) => y + z, 0)).reduce((x, y) => x + y, 0));
        totalCalories.then(x => this.setState({totalCalories: x}))
    }

    render() {

        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo"/>
                    <p>
                        Total number of calories for 13/03 is {this.state.totalCalories}.
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
}

export default App;
