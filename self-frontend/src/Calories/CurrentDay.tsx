import React from "react";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {IFoodEntry} from "conjure-self-api/self-calories/foodEntry";
import {IMacroGoals} from "conjure-self-api/self-calories/macroGoals";
import assert from "assert";
import {IMeal} from "conjure-self-api/self-calories/meal";

interface CurrentDayProps {
    currentDayMeals: IMealsForDay | null,
    currentDayGoals: IMacroGoals | null
}

interface CurrentDayState {

}

function capitaliseFirstLetter(s: String) {
    assert(s != null && s.length >= 1, "Tried to capitalise an empty string");
    return s.charAt(0).toUpperCase() + s.slice(1);
}


class CurrentDay extends React.Component<CurrentDayProps, CurrentDayState> {

    totalOfXForMeal(X: keyof IFoodEntry, meal: IMeal): number {
        return meal.entries
                .map(x => x[X] as number)
                .reduce((x, y) => x + y, 0);
    }

    totalOfX(X: keyof IFoodEntry): number {
        // @ts-ignore
        return this.props.currentDayMeals.meals
            .map(x => this.totalOfXForMeal(X, x))
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
                <div>
                    <h1>Today's Summary</h1>
                    <p>Total calories (kCal): <b>{calories}</b> / {this.props.currentDayGoals.calories}</p>
                    <p>Total protein (g): <b>{protein}</b> / {this.props.currentDayGoals.protein}</p>
                    <p>Total fat (g): <b>{fat}</b> / {this.props.currentDayGoals.fat}</p>
                    <p>Total carbs (g): <b>{carbs}</b> / {this.props.currentDayGoals.carbohydrates}</p>
                </div>
                <br/>
                <div>
                    <h2>Items</h2>
                    {
                        this.props.currentDayMeals.meals.map(meal => {
                            return (<div>
                                <h3>{
                                    capitaliseFirstLetter(meal.name) + ": " +
                                    this.totalOfXForMeal('calories', meal) + "kCal, " +
                                    this.totalOfXForMeal('carbohydrates', meal) + "c, " +
                                    this.totalOfXForMeal('protein', meal) + "p, " +
                                    this.totalOfXForMeal('fat', meal) + "f"
                                }</h3>
                                {meal.entries.map(entry => {
                                    return (<p>{entry.name}</p>)
                                })}
                                <br/>
                            </div>);
                        })
                    }
                </div>
            </div>
        );
    }
}

export {CurrentDay};