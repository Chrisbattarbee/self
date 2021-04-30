import React from "react";
import {DefaultHttpApiBridge} from "conjure-client";
import {WorkoutService} from "conjure-self-api/self-workouts";
import {IWorkout} from "conjure-self-api/self-workouts/workout";
import CalendarHeatMap from "react-calendar-heatmap"
import 'react-calendar-heatmap/dist/styles.css';
import {Container, Grid, GridColumn, GridRow} from "semantic-ui-react";
import {ExerciseGraph, Granularity} from "./ExerciseGraph";
import {dateToString} from "../Utils";

interface WorkoutPanelProps {

}

interface WorkoutPanelState {
    workoutService: WorkoutService
    interval: ReturnType<typeof setTimeout> | undefined;
    workouts: IWorkout[]
}

const NUMBER_OF_DAYS_IN_THE_PAST_TO_GET = 365;

class WorkoutPanel extends React.Component<WorkoutPanelProps, WorkoutPanelState> {
    constructor(props: WorkoutPanelProps) {
        super(props);
        let bridge: DefaultHttpApiBridge = new DefaultHttpApiBridge({
            baseUrl: "http://self.chrisbattarbee.com",
            userAgent: {
                productName: "self-api-frontend",
                productVersion: "0.0.1"
            }
        });
        let workoutService: WorkoutService = new WorkoutService(bridge);
        this.state = {
            workoutService: workoutService,
            interval: undefined,
            workouts: []
        };
    }

    dateXDaysAgo(numDays: number): Date {
        return new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    }

    setWorkouts() {
        let currentDate = new Date(Date.now()).toISOString().split('T')[0];
        let dateInThePast = this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET).toISOString().split('T')[0];
        this.state.workoutService.getWorkoutsInRange(dateInThePast, currentDate).then(workouts => {
            this.setState(state => {
                return {workouts: workouts}
            });
        });
    }

    componentDidMount() {
        this.setWorkouts();
        let interval = setInterval(() => this.setWorkouts(), 10 * 60 * 1000, this);
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
            <Container>
                <h2 style={{textAlign: "center"}}>Historical Workouts</h2>
                <Container style={{width: 600}}>
                    <CalendarHeatMap
                        values={this.state.workouts.filter(x => x.sessionLength > 0).map(x => ({
                            date: x.date,
                            count: 1
                        }))}
                        startDate={this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET)}
                        endDate={Date.now()}
                        showMonthLabels={true}
                        showWeekdayLabels={true}
                    />
                </Container>
                <Grid columns={2}>

                    <GridRow>
                        <GridColumn>
                            <ExerciseGraph startDate={dateToString(this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET))}
                                           endDate={dateToString(this.dateXDaysAgo(0))}
                                           exerciseName={"Barbell Bench Press"}
                                           exerciseRepRange={8}
                                           workouts={this.state.workouts}
                                           granularity={Granularity.DAY}
                                           additionalTitleText={"(hypertrophy)"}
                            />
                        </GridColumn>
                        <GridColumn>
                            <ExerciseGraph startDate={dateToString(this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET))}
                                           endDate={dateToString(this.dateXDaysAgo(0))}
                                           exerciseName={"Barbell Squat"}
                                           exerciseRepRange={8}
                                           workouts={this.state.workouts}
                                           granularity={Granularity.DAY}
                                           additionalTitleText={"(hypertrophy)"}
                            />
                        </GridColumn>
                    </GridRow>

                    <GridRow>
                        <GridColumn>
                            <ExerciseGraph startDate={dateToString(this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET))}
                                           endDate={dateToString(this.dateXDaysAgo(0))}
                                           exerciseName={"Cable Seated Row"}
                                           exerciseRepRange={8}
                                           workouts={this.state.workouts}
                                           granularity={Granularity.DAY}
                                           additionalTitleText={"(hypertrophy)"}
                            />
                        </GridColumn>
                        <GridColumn>
                            <ExerciseGraph startDate={dateToString(this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET))}
                                           endDate={dateToString(this.dateXDaysAgo(0))}
                                           exerciseName={"Dumbbell One Arm Row"}
                                           exerciseRepRange={8}
                                           workouts={this.state.workouts}
                                           granularity={Granularity.DAY}
                                           additionalTitleText={"(hypertrophy)"}
                            />
                        </GridColumn>
                    </GridRow>


                    <GridRow>
                        <GridColumn>
                            <ExerciseGraph startDate={dateToString(this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET))}
                                           endDate={dateToString(this.dateXDaysAgo(0))}
                                           exerciseName={"Barbell Preacher Curl"}
                                           exerciseRepRange={8}
                                           workouts={this.state.workouts}
                                           granularity={Granularity.DAY}
                                           additionalTitleText={"(hypertrophy)"}
                            />
                        </GridColumn>
                        <GridColumn>
                            <ExerciseGraph startDate={dateToString(this.dateXDaysAgo(NUMBER_OF_DAYS_IN_THE_PAST_TO_GET))}
                                           endDate={dateToString(this.dateXDaysAgo(0))}
                                           exerciseName={"Cable Triceps Pushdown"}
                                           exerciseRepRange={12}
                                           workouts={this.state.workouts}
                                           granularity={Granularity.DAY}
                                           additionalTitleText={"(hypertrophy)"}
                            />
                        </GridColumn>
                    </GridRow>


                </Grid>
            </Container>
        )
    }
}

export
{
    WorkoutPanel
}
    ;