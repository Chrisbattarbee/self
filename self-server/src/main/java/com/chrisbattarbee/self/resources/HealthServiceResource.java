package com.chrisbattarbee.self.resources;

import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.chrisbattarbee.self.health.HealthService;
import com.chrisbattarbee.self.workouts.HealthDataPoint;
import com.chrisbattarbee.self.workouts.PostHealthData;
import com.google.common.base.Splitter;
import com.google.common.collect.Iterables;
import com.palantir.logsafe.SafeArg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

public class HealthServiceResource extends SelfResource implements HealthService {
    private static final String HEALTH_DYNAMO_TABLE = "self_api_health";
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
                .forEach(healthMetric -> healthMetric.getData().forEach(healthMetricInner -> super.getDynamoManager()
                        .putObjectIntoDynamo(
                                HEALTH_DYNAMO_TABLE,
                                HealthDataPoint.builder()
                                        .name(healthMetric.getName())
                                        .unit(healthMetric.getUnits())
                                        .date(healthMetricInner.getDate())
                                        .amount(healthMetricInner.getQty())
                                        .key(buildKey(
                                                healthMetric.getName(),
                                                parseDateFromDateTime(healthMetricInner.getDate())))
                                        .build())));
    }

    @Override
    public List<HealthDataPoint> getHealthDataInRange(String metricName, String startDate, String endDate) {
        logger.info(
                "Received request to get {} between {} and {}",
                SafeArg.of("metricName", metricName),
                SafeArg.of("startDate", startDate),
                SafeArg.of("endDate", endDate));

        List<String> keys = Utils.getDatesInRange(startDate, endDate).stream()
                .map(date -> buildKey(metricName, date))
                .collect(Collectors.toList());

        return super.getDynamoManager()
                .getObjectsFromDynamoBatched(HEALTH_DYNAMO_TABLE, TABLE_KEY, keys, HealthDataPoint.class);
    }

    @Override
    void createDynamoTablesIfTheyDontExist() {
        super.getDynamoManager()
                .createDynamoTableIfItDoesntExist(HEALTH_DYNAMO_TABLE, TABLE_KEY, PROVISIONED_THROUGHPUT);
    }

    private static String parseDateFromDateTime(String dateTime) {
        return Iterables.get(Splitter.on(' ').split(dateTime), 0);
    }

    private static String buildKey(String metricName, String date) {
        return String.format("%s-%s", metricName, date);
    }
}
