import React from "react";
import {DefaultHttpApiBridge} from "conjure-client";
import {CalorieService} from "conjure-self-api/self-calories";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {HistoricalMacros} from "./HistoricalMacros";
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
    interval: number | undefined;
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
            interval: undefined
        };
    }

    dateXDaysAgo(numDays: number): Date {
        return new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    }

    setLastWeeksMealsAndGoals() {
        let currentDate = new Date(Date.now()).toISOString().split('T')[0];
        let dateInThePast = this.dateXDaysAgo(7).toISOString().split('T')[0];
        this.state.calorieService.getDailyCaloriesInRange(dateInThePast, currentDate).then(meals => {
            this.setState(state => {
                return {lastWeeksMeals: meals}
            });
        });
        this.state.calorieService.getDailyMacroGoalsInRange(dateInThePast, currentDate).then(macroGoals => {
            this.setState(state => {
                return {lastWeeksGoals: macroGoals}
            });
        });
    }

    componentDidMount() {
        this.setLastWeeksMealsAndGoals();
        let interval = setInterval(() => this.setLastWeeksMealsAndGoals(), 10 * 60 * 1000, this);
        this.setState(_ => {
            return {
                interval: interval,
            }
        });
    }

    componentWillUnmount() {
        if (this.state.interval !== undefined) {
            clearInterval(this.state.interval);
        }
    }

    render() {
        return (
            <Container style={{width: 600}}>
                <Container>
                    <HistoricalMacros
                        lastWeeksMeals={this.state.lastWeeksMeals}
                        lastWeeksGoals={this.state.lastWeeksGoals}
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