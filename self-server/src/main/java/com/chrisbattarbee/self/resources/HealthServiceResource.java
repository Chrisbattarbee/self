package com.chrisbattarbee.self.resources;

import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.chrisbattarbee.self.health.HealthService;
import com.chrisbattarbee.self.workouts.HealthDataPoint;
import com.chrisbattarbee.self.workouts.PostHealthData;
import com.palantir.logsafe.SafeArg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

public class HealthServiceResource extends SelfResource implements HealthService {
    private static final String HEALTH_DYNAMO_TABLE = "self_api_health_service";
    private static final String TABLE_KEY = "key";
    private static final long READ_THROUGHPUT = 1L;
    private static final long WRITE_THROUGHPUT = 1L;
    private static final ProvisionedThroughput PROVISIONED_THROUGHPUT =
            new ProvisionedThroughput(READ_THROUGHPUT, WRITE_THROUGHPUT);

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public void putHealthData(PostHealthData data) {
        logger.info("Received request to put health data");
        data.getData()
                .getMetrics()
                .forEach(healthMetric -> healthMetric.getData().forEach(healthMetricInner -> {
                    logger.info(
                            "Putting {} health data into dynamo for date {}",
                            SafeArg.of("metric", healthMetric.getName()),
                            SafeArg.of("date", healthMetricInner.getDate()));
                    super.getDynamoManager()
                            .putObjectIntoDynamo(
                                    HEALTH_DYNAMO_TABLE,
                                    HealthDataPoint.builder()
                                            .name(healthMetric.getName())
                                            .unit(healthMetric.getUnits())
                                            .date(healthMetricInner.getDate())
                                            .amount(healthMetricInner.getQty())
                                            .key(String.format(
                                                    "%s-%s", healthMetric.getName(), healthMetricInner.getDate())));
                }));
    }

    @Override
    public List<HealthDataPoint> getHealthDataInRange(String metricName, String startDate, String endDate) {
        throw new UnsupportedOperationException();
    }

    @Override
    void createDynamoTablesIfTheyDontExist() {
        super.getDynamoManager()
                .createDynamoTableIfItDoesntExist(HEALTH_DYNAMO_TABLE, TABLE_KEY, PROVISIONED_THROUGHPUT);
    }
}
