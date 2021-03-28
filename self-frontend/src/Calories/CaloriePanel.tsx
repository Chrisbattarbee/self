import React from "react";
import {DefaultHttpApiBridge} from "conjure-client";
import {CalorieService} from "conjure-self-api";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {HistoricalMacros} from "./HistoricalMacros";
import * as _ from "lodash";
import {CurrentDay} from "./CurrentDay";
import {Container, Divider} from "semantic-ui-react";

interface CaloriePanelProps {

}

interface CaloriePanelState {
    totalCalories: number,
    calorieService: CalorieService,
    lastWeeksMeals: IMealsForDay[]
}


class CaloriePanel extends React.Component<CaloriePanelProps, CaloriePanelState> {

    constructor(props: CaloriePanelProps) {
        super(props);
        let bridge: DefaultHttpApiBridge = new DefaultHttpApiBridge({
            baseUrl: "http://self.chrisbattarbee.com",
            userAgent: {
                productName: "self-api-frontend",
                productVersion: "0.0.1"
            }
        });
        let calorieService: CalorieService = new CalorieService(bridge);
        this.state = {
            totalCalories: 0,
            calorieService: calorieService,
            lastWeeksMeals: [],
        };
    }

    dateXDaysAgo(numDays: number): Date {
        return new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    }

    setLastWeeksMeals() {
        _.range(7).forEach(x => {
            let date = this.dateXDaysAgo(x);
            let mealsForDate = this.state.calorieService.getDailyCalories(date.toISOString().split('T')[0]);
            mealsForDate.then(meals => {
                this.setState(state => {
                    return {lastWeeksMeals: state.lastWeeksMeals.concat([meals])}
                });
            })
        });
    }

    componentDidMount() {
        this.setLastWeeksMeals();
    }

    render() {
        return (
            <Container style={{width: 600}}>
                <Container>
                    <HistoricalMacros
                        lastWeeksMeals={this.state.lastWeeksMeals}
                    />
                </Container>
                <Divider/>
                <CurrentDay
                    currentDayMeals={this.state.lastWeeksMeals.filter(x => x.date === new Date().toISOString().split('T')[0])[0]}
                />
            </Container>
        )
    }
}

export {CaloriePanel};