import React, { Fragment } from "react";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {ResponsiveBar} from "@nivo/bar";
import {line} from "d3-shape";
import * as _ from "lodash";
import {IMacroGoals} from "conjure-self-api/self-calories/macroGoals";

const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

interface PlottableMacrosData {
    date: string,
    proteinCalories: number,
    carbsCalories: number,
    fatCalories: number,
    goalCalories: number
}

interface HistoricalMacrosProps {
    lastWeeksMeals: IMealsForDay[],
    lastWeeksGoals: IMacroGoals[],
}

interface HistoricalMacrosState {

}

class HistoricalMacros extends React.Component<HistoricalMacrosProps, HistoricalMacrosState> {
    generateLastWeeksPlottableMacrosData(): PlottableMacrosData[] {
        return this.props.lastWeeksMeals.map(x => {
            return {
                date: x.date,
                proteinCalories: x.meals.map(y => y.entries.map(z => (z.protein as number) * PROTEIN_CALORIES_PER_GRAM).reduce((x, y) => x + y, 0)).reduce((x, y) => x + y, 0),
                carbsCalories: x.meals.map(y => y.entries.map(z => (z.carbohydrates as number) * CARBS_CALORIES_PER_GRAM).reduce((x, y) => x + y, 0)).reduce((x, y) => x + y, 0),
                fatCalories: x.meals.map(y => y.entries.map(z => (z.fat as number) * FAT_CALORIES_PER_GRAM).reduce((x, y) => x + y, 0)).reduce((x, y) => x + y, 0),
                goalCalories: this.props.lastWeeksGoals.filter(y => y.date === x.date)[0].calories as number
            }
        }).sort((x, y) => (new Date(x.date).getTime()) - (new Date(y.date).getTime()))
            .map(x => {
                return {
                    ...x,
                    date: x.date.substring(5)
                }
            })
    }

    render() {
        if (!_.isEqual(this.props.lastWeeksGoals.map(x => x.date).sort(), this.props.lastWeeksMeals.map(x => x.date).sort())) {
            return <div/>;
        }
        let lastWeeksMacrosPlotData = this.generateLastWeeksPlottableMacrosData();
        // @ts-ignore
        const LineLayer = ({ bars, xScale, yScale }) => {
            const lineGenerator = line<PlottableMacrosData>()
                .x((d, index, data) => xScale(index))
                .y((d, index, data) => yScale(d.goalCalories));

            // @ts-ignore
            return (
                <Fragment>
                    <path
                        d={lineGenerator(bars) as string}
                        fill="none"
                        stroke={"rgba(200, 30, 15, 1)"}
                        style={{ pointerEvents: "none" }}
                    />
                </Fragment>
            );
        };

        return (
            <div style={{height: 300}}>
                <h2 style={{textAlign: "center"}}>Historical Macros</h2>
                <ResponsiveBar
                    data={lastWeeksMacrosPlotData}
                    keys={['proteinCalories', 'carbsCalories', 'fatCalories']}
                    indexBy="date"
                    margin={{top: 20, right: 140, bottom: 80, left: 70}}
                    padding={0.3}
                    valueScale={{type: 'linear'}}
                    indexScale={{type: 'band', round: true}}
                    colors={{scheme: 'nivo'}}
                    defs={[
                        {
                            id: 'dots',
                            type: 'patternDots',
                            background: 'inherit',
                            color: '#38bcb2',
                            size: 4,
                            padding: 1,
                            stagger: true
                        },
                        {
                            id: 'lines',
                            type: 'patternLines',
                            background: 'inherit',
                            color: '#eed312',
                            rotation: -45,
                            lineWidth: 6,
                            spacing: 10
                        }
                    ]}
                    borderColor={{from: 'color', modifiers: [['darker', 1.6]]}}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Date',
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Calories (kCal)',
                        legendPosition: 'middle',
                        legendOffset: -50
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{from: 'color', modifiers: [['darker', 1.6]]}}
                    legends={[
                        {
                            dataFrom: 'keys',
                            anchor: 'bottom-right',
                            direction: 'column',
                            justify: false,
                            translateX: 120,
                            translateY: 0,
                            itemsSpacing: 2,
                            itemWidth: 100,
                            itemHeight: 20,
                            itemDirection: 'left-to-right',
                            itemOpacity: 0.85,
                            symbolSize: 20,
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemOpacity: 1
                                    }
                                }
                            ]
                        }
                    ]}
                    animate={false}
                    motionStiffness={90}
                    motionDamping={15}
                    layers={["grid", "axes", "bars", "markers", "legends", LineLayer]}
                />
            </div>
        )
    }

}


export {HistoricalMacros};