import React from "react";
import {DefaultHttpApiBridge} from "conjure-client";
import {Container, Divider} from "semantic-ui-react";
import {HealthService} from "conjure-self-api/self-health/healthService";
import {IHealthDataPoint} from "conjure-self-api/self-workouts/healthDataPoint";
import {HealthChart} from "./HealthChart";

interface HealthPanelProps {
    metricsToUse: string[]
}

interface HealthPanelState {
    healthService: HealthService,
    interval: number | undefined;
    metrics: Map<string, IHealthDataPoint[]>
}


class HealthPanel extends React.Component<HealthPanelProps, HealthPanelState> {

    constructor(props: HealthPanelProps) {
        super(props);
        let bridge: DefaultHttpApiBridge = new DefaultHttpApiBridge({
            baseUrl: "http://self.chrisbattarbee.com",
            userAgent: {
                productName: "self-api-frontend",
                productVersion: "0.0.1"
            }
        });
        let healthService: HealthService = new HealthService(bridge);
        this.state = {
            healthService: healthService,
            interval: undefined,
            metrics: new Map<string, IHealthDataPoint[]>(),
        }
    }

    dateXDaysAgo(numDays: number): Date {
        return new Date(Date.now() - numDays * 24 * 60 * 60 * 1000);
    }

    setMetric(metric: string) {
        let currentDate = new Date(Date.now()).toISOString().split('T')[0];
        let dateInThePast = this.dateXDaysAgo(7).toISOString().split('T')[0];
        this.state.healthService.getHealthDataInRange(metric, dateInThePast, currentDate).then(dataPoints => {
            this.setState(state => {
                return {metrics: state.metrics.set(metric, dataPoints.sort((a, b) => a.date.localeCompare(b.date)))}
            });
        });
    }

    componentDidMount() {
        this.props.metricsToUse.forEach(metric => this.setMetric(metric));
        let interval = setInterval(() => this.props.metricsToUse.forEach(metric => this.setMetric(metric)),
            10 * 60 * 1000, this);
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
        let components: JSX.Element[] = [];

        this.state.metrics.forEach((value, key) => {
            components.push(
                <HealthChart metricName={key} unit={value[0].unit} width={300} height={200} data={value.map(x => {
                        return {x: new Date(x.date), y: x.amount}
                    }
                )}/>
            )
        })
        return (
            <Container style={{width: 600}}>
                {components}
            </Container>
        )
    }
}

export {
    HealthPanel
};