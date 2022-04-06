import React from "react";
import {IWorkout} from "conjure-self-api/self-workouts/workout";
import {IExercise} from "conjure-self-api/self-workouts/exercise";
import {ISet} from "conjure-self-api/self-workouts/set";
import {ResponsiveLine} from "@nivo/line";
import {dateToString} from "../Utils";
import {HealthChart} from "../Health/HealthChart";

enum Granularity {
    DAY,
    WEEK,
    MONTH,
    YEAR
}

interface ExerciseGraphProps {
    startDate: string,
    endDate: string,
    exerciseName: string,
    exerciseRepRange: number,
    workouts: IWorkout[],
    granularity: Granularity,
    additionalTitleText?: string
}

interface ExerciseGraphState {
}

interface PartitionedWorkouts {
    startDate: string,
    workouts: IWorkout[]
}

interface PartitionedMaxWeight {
    startDate: string,
    maxWeight: number | null
}


class ExerciseGraph extends React.Component<ExerciseGraphProps, ExerciseGraphState> {
    private static isDateBetween(date: string, startDate: string, endDate: string): boolean {
        let d = Date.parse(date);
        let d1 = Date.parse(startDate);
        let d2 = Date.parse(endDate);

        return d >= d1 && d <= d2;
    }

    // Returns the ISO week of the date.
    private static getWeek(inputDate: Date) {
        let date = new Date(inputDate.getTime());
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        let week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
            - 3 + (week1.getDay() + 6) % 7) / 7);
    }

    private static getDateOfISOWeek(year: number, week: number): Date {
        let simple = new Date(year, 0, 1 + (week - 1) * 7);
        let dow = simple.getDay();
        let ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    private static partitionDay(workouts: IWorkout[]): PartitionedWorkouts[] {
        // Workouts are a one per day construct, so we can just return each workout on that day
        return workouts.map(x => {
            return {startDate: x.date, endDate: x.date, workouts: [x]}
        });
    }

    private static partitionWeek(workouts: IWorkout[]): PartitionedWorkouts[] {
        // Group by year and week number
        let map: Map<string, IWorkout[]> = new Map<string, IWorkout[]>();
        workouts.forEach(workout => {
            let date = new Date(Date.parse(workout.date));
            let year = date.getFullYear();
            let weekOfYear = ExerciseGraph.getWeek(date);
            let startOfWeekDate = ExerciseGraph.getDateOfISOWeek(year, weekOfYear).toISOString().split('T')[0];
            if (map.get(startOfWeekDate)) {
                map.get(startOfWeekDate)!.push(workout);
            } else {
                map.set(startOfWeekDate, [workout]);
            }
        });
        let retList: PartitionedWorkouts[] = [];
        map.forEach((value, key) => {
            retList.push({
                startDate: key,
                workouts: value
            });
        });
        return retList;
    }

    private static partitionMonth(workouts: IWorkout[]): PartitionedWorkouts[] {
        // We extract the year and month and group based on that
        let map: Map<string, IWorkout[]> = new Map<string, IWorkout[]>();
        workouts.forEach(workout => {
            let date = new Date(Date.parse(workout.date));
            let startOfYearDate = dateToString(new Date(date.getFullYear(), date.getMonth(), 1));
            if (map.get(startOfYearDate)) {
                map.get(startOfYearDate)!.push(workout);
            } else {
                console.log(date);
                map.set(startOfYearDate, [workout]);
            }
        });
        let retList: PartitionedWorkouts[] = [];
        map.forEach((value, key) => {
            retList.push({
                startDate: key,
                workouts: value
            });
        });
        return retList;
    }

    private static partitionYear(workouts: IWorkout[]): PartitionedWorkouts[] {
        // We extract the year and group based on that
        let map: Map<string, IWorkout[]> = new Map<string, IWorkout[]>();
        workouts.forEach(workout => {
            let date = new Date(Date.parse(workout.date));
            let startOfYearDate = dateToString(new Date(date.getFullYear(), 1));
            if (map.get(startOfYearDate)) {
                map.get(startOfYearDate)!.push(workout);
            } else {
                map.set(startOfYearDate, [workout]);
            }
        });
        let retList: PartitionedWorkouts[] = [];
        map.forEach((value, key) => {
            retList.push({
                startDate: key,
                workouts: value
            });
        });
        return retList;
    }

    private static partitionWorkouts(workouts: IWorkout[], granularity: Granularity): PartitionedWorkouts[] {
        // Sort them so we can bucket them
        workouts = workouts.sort((x, y) => Date.parse(y.date) - Date.parse(x.date));
        switch (granularity) {
            case Granularity.DAY:
                return ExerciseGraph.partitionDay(workouts);
            case Granularity.WEEK:
                return ExerciseGraph.partitionWeek(workouts);
            case Granularity.MONTH:
                return ExerciseGraph.partitionMonth(workouts);
            case Granularity.YEAR:
                return ExerciseGraph.partitionYear(workouts);
        }
    }

    private static maxWeightForRepRangeInPartition(partitionedWorkouts: PartitionedWorkouts[],
                                                   exerciseName: string,
                                                   repRange: number): PartitionedMaxWeight[] {
        return partitionedWorkouts.map(partition => {
            let allExercisesInPartition: IExercise[] = partition.workouts.map(workout => workout.exercises).flat(1);
            let matchingExercises = allExercisesInPartition.filter(exercise => exercise.name === exerciseName);
            let allSetsInMatchingExercises: ISet[] = matchingExercises.map(exercise => exercise.sets).flat(1);
            let matchingSets = allSetsInMatchingExercises.filter(set => set.reps === repRange);
            let maximumWeightForPartitionExerciseNameAndRepRange: number | null = Math.max(...(matchingSets.map(set => set.weight) as number[]));
            return {
                startDate: partition.startDate,
                maxWeight: maximumWeightForPartitionExerciseNameAndRepRange
            }
        }).filter(x => x.maxWeight !== -Infinity)
    }

    private static convertToRenderable(partitionedMaxWeights: PartitionedMaxWeight[]) {
        return [{
            id: "line",
            data: partitionedMaxWeights.map(pWeight => ({x: pWeight.startDate, y: pWeight.maxWeight})),
        }]
    }


    render() {
        let workoutsInRange = this.props.workouts
            .filter(x => ExerciseGraph.isDateBetween(x.date, this.props.startDate, this.props.endDate));
        let partitionedWorkouts = ExerciseGraph.partitionWorkouts(workoutsInRange, this.props.granularity);
        let maxWeightForRepRange = ExerciseGraph.maxWeightForRepRangeInPartition(
            partitionedWorkouts,
            this.props.exerciseName,
            this.props.exerciseRepRange
        );
        let data = maxWeightForRepRange.map(value => {
            return {
                x: new Date(value.startDate),
                y: value.maxWeight as number
            }
        });

        return (
            <HealthChart width={350} height={300} data={data}
                         metricName={this.props.exerciseName + " " + this.props.exerciseRepRange + " reps"}
                         unit={"kg"}/>
        );
    }
}

export
{
    ExerciseGraph, Granularity
}
    ;