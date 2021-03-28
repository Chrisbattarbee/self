import React from "react";
import {DefaultHttpApiBridge} from "conjure-client";
import {CalorieService} from "conjure-self-api";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {HistoricalMacros} from "./HistoricalMacros";
import * as _ from "lodash";
import {CurrentDay} from "./CurrentDay";
import {Container, Divider} from "semantic-ui-react";
import {IMacroGoals} from "conjure-self-api/self-calories/macroGoals";

interface CaloriePanelProps {

}

interface CaloriePanelState {
    totalCalories: number,
    calorieService: CalorieService,
    lastWeeksMeals: IMealsForDay[],
    lastWeeksGoals: IMacroGoals[],
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
            lastWeeksGoals: [],
        };
    }

    dateXDaysAgo(numDays: number): Date {
        return new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    }

    setLastWeeksMealsAndGoals() {
        _.range(7).forEach(x => {
            let date = this.dateXDaysAgo(x);
            let dateString = date.toISOString().split('T')[0];
            let mealsForDate = this.state.calorieService.getDailyCalories(dateString);
            mealsForDate.then(meals => {
                this.setState(state => {
                    return {lastWeeksMeals: state.lastWeeksMeals.concat([meals])}
                });
            })
            let goalsForDate = this.state.calorieService.getDailyMacroGoals(dateString);
            goalsForDate.then(goals => {
                this.setState(state => {
                    return {lastWeeksGoals: state.lastWeeksGoals.concat([goals])}
                });
            });
        });
    }

    componentDidMount() {
        this.setLastWeeksMealsAndGoals();
    }

    render() {
        // return (<div></div>);
        return (
            <Container style={{width: 600}}>
                <Container>
                    <HistoricalMacros
                        lastWeeksMeals={this.state.lastWeeksMeals}
                    />
                </Container>
                <Divider/>
                <CurrentDay
                    currentDayMeals={
                        this.state.lastWeeksMeals.length > 0 ?
                            this.state.lastWeeksMeals.filter(x => x.date === new Date().toISOString().split('T')[0])[0] :
                            null
                    }
                    currentDayGoals={
                        this.state.lastWeeksGoals.length > 0 ?
                            this.state.lastWeeksGoals.filter(x => x.date === new Date().toISOString().split('T')[0])[0] :
                            null
                    }
                />
            </Container>
        )
    }
}

export {CaloriePanel};