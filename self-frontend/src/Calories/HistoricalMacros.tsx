import React from "react";
import {IMealsForDay} from "conjure-self-api/self-calories/mealsForDay";
import {ResponsiveBar} from "@nivo/bar";

const PROTEIN_CALORIES_PER_GRAM = 4;
const CARBS_CALORIES_PER_GRAM = 4;
const FAT_CALORIES_PER_GRAM = 9;

interface PlottableMacrosData {
    date: string,
    proteinCalories: number,
    carbsCalories: number,
    fatCalories: number
}

interface HistoricalMacrosProps {
    lastWeeksMeals: IMealsForDay[]
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
        let lastWeeksMacrosPlotData = this.generateLastWeeksPlottableMacrosData();
        return (
            <div style={{height: 300}}>
                <h2>Historical Macros</h2>
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
                />
            </div>
        )
    }

}


export {HistoricalMacros};