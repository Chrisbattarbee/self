import React from "react";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {IFoodEntry} from "conjure-self-api/self-calories/foodEntry";
import {IMacroGoals} from "conjure-self-api/self-calories/macroGoals";

interface CurrentDayProps {
    currentDayMeals: IMealsForDay | null,
    currentDayGoals: IMacroGoals | null
}

interface CurrentDayState {

}

class CurrentDay extends React.Component<CurrentDayProps, CurrentDayState> {
    totalOfX(X: keyof IFoodEntry): number {
        // @ts-ignore
        return this.props.currentDayMeals.meals
            .map(x => x.entries
                .map(x => x[X] as number)
                .reduce((x, y) => x + y, 0))
            .reduce((x, y) => x + y, 0)
    }

    totalCalories(): number {
        return this.totalOfX('calories');
    }

    totalGramsOfFat(): number {
        return this.totalOfX('fat');
    }

    totalGramsOfCarbs(): number {
        return this.totalOfX('carbohydrates');
    }

    totalGramsOfProtein(): number {
        return this.totalOfX('protein');
    }

    render() {
        if (this.props.currentDayMeals == null || this.props.currentDayGoals == null) {
            return (<div/>);
        }
        let calories = this.totalCalories();
        let protein = this.totalGramsOfProtein();
        let fat = this.totalGramsOfFat();
        let carbs = this.totalGramsOfCarbs();
        return (
            <div style={{textAlign: "center"}}>
                <h1>Today's Stats</h1>
                <p>Total calories (kCal): <b>{calories}</b> / {this.props.currentDayGoals.calories}</p>
                <p>Total protein (g): <b>{protein}</b> / {this.props.currentDayGoals.protein}</p>
                <p>Total fat (g): <b>{fat}</b> / {this.props.currentDayGoals.fat}</p>
                <p>Total carbs (g): <b>{carbs}</b> / {this.props.currentDayGoals.carbohydrates}</p>
            </div>
        );
    }
}

export {CurrentDay};