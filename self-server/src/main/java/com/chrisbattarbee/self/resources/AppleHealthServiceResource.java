package com.chrisbattarbee.self.resources;

import com.chrisbattarbee.self.health.HealthService;
import com.chrisbattarbee.self.workouts.HealthDataPoint;
import com.chrisbattarbee.self.workouts.PostHealthData;

import java.util.List;

public class AppleHealthServiceResource extends SelfResource implements HealthService {
    @Override
    public void putHealthData(PostHealthData data) {
        throw new UnsupportedOperationException();
    }

    @Override
    public List<HealthDataPoint> getHealthDataInRange(String metricName, String startDate, String endDate) {
        throw new UnsupportedOperationException();
    }

    @Override
    void createDynamoTablesIfTheyDontExist() {
        throw new UnsupportedOperationException();
    }
}
