import React from "react";
import {DefaultHttpApiBridge} from "conjure-client";
import {CalorieService} from "conjure-self-api";

interface CaloriePanelProps {

}

interface CaloriePanelState {
    totalCalories: number
}

class CaloriePanel extends React.Component<CaloriePanelProps, CaloriePanelState> {

    constructor(props: CaloriePanelProps) {
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
        let currentIsoDate = new Date().toISOString();
        let mealsForDay = calorieService.getDailyCalories(currentIsoDate);
        let totalCalories = mealsForDay.then(x => x.meals.map(x => x.entries.map(y => (y.calories as number)).reduce((y, z) => y + z, 0)).reduce((x, y) => x + y, 0));
        totalCalories.then(x => this.setState({totalCalories: x}))
    }

    render() {
        return (
            <div>
                Hello this a panel. You've consumed {this.state.totalCalories} calories today.
            </div>
        )
    }
}

export {CaloriePanel};