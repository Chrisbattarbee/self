package com.chrisbattarbee.self.resources;

import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.chrisbattarbee.self.workouts.Workout;
import com.chrisbattarbee.self.workouts.WorkoutService;
import com.palantir.logsafe.SafeArg;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class WorkoutServiceResource extends SelfResource implements WorkoutService {
    private static final String WORKOUTS_DYNAMO_TABLE = "self_api_workout";
    private static final String TABLE_KEY = "date";
    private static final long READ_THROUGHPUT = 1L;
    private static final long WRITE_THROUGHPUT = 1L;
    private static final ProvisionedThroughput PROVISIONED_THROUGHPUT =
            new ProvisionedThroughput(READ_THROUGHPUT, WRITE_THROUGHPUT);

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    public void updateDailyWorkout(Workout updateDayRequest) {
        logger.info("Received request to update workout for {}", SafeArg.of("date", updateDayRequest.getDate()));
        super.getDynamoManager().putObjectIntoDynamo(WORKOUTS_DYNAMO_TABLE, updateDayRequest);
    }

    @Override
    public Workout getDailyWorkout(String date) {
        logger.info("Received request to get workout for {}", SafeArg.of("date", date));
        return super.getDynamoManager().getObjectFromDynamo(WORKOUTS_DYNAMO_TABLE, TABLE_KEY, date, Workout.class);
    }

    @Override
    public List<Workout> getWorkoutsInRange(String startDate, String endDate) {
        logger.info(
                "Received request to get workouts between {} and {}",
                SafeArg.of("startDate", startDate),
                SafeArg.of("endDate", endDate));

        List<String> datesInRange = Utils.getDatesInRange(startDate, endDate);
        return super.getDynamoManager()
                .getObjectsFromDynamoBatched(WORKOUTS_DYNAMO_TABLE, TABLE_KEY, datesInRange, Workout.class);
    }

    @Override
    void createDynamoTablesIfTheyDontExist() {
        super.getDynamoManager()
                .createDynamoTableIfItDoesntExist(WORKOUTS_DYNAMO_TABLE, TABLE_KEY, PROVISIONED_THROUGHPUT);
    }
}
