import React from "react";
import {
    Crosshair,
    HorizontalGridLines,
    LineSeries,
    LineSeriesPoint,
    VerticalGridLines,
    XAxis,
    XYPlot,
    YAxis
} from "react-vis";
import {curveCatmullRom} from "d3-shape";
import "react-vis/dist/style.css";


interface HealthChartProps {
    width: number
    height: number
    data: LineSeriesPoint[] | any[]
    metricName: string
    unit: string
}

interface HealthChartState {
}

class HealthChart extends React.Component<HealthChartProps, HealthChartState> {
    render() {
        return (
            <XYPlot style={{margin: '10px'}} width={this.props.width} height={this.props.height} xType={"time"}>
                <HorizontalGridLines style={{stroke: '#B7E9ED'}}/>
                <VerticalGridLines style={{stroke: '#B7E9ED'}}/>
                <XAxis
                    title="Time"
                    style={{
                        line: {stroke: '#ADDDE1'},
                        ticks: {stroke: '#ADDDE1'},
                        text: {stroke: 'none', fill: '#6b6b76', fontWeight: 600}
                    }}
                    tickFormat={function tickFormat(d) {
                        const date = new Date(d)
                        return date.toISOString().substr(5, 5)
                    }}
                />
                <YAxis title={this.props.metricName + " " + this.props.unit}/>
                <LineSeries
                    curve={curveCatmullRom.alpha(0.5)}
                    data={this.props.data}
                    fill={0.0}
                />
            </XYPlot>
        );
    }
}

export {HealthChart};
