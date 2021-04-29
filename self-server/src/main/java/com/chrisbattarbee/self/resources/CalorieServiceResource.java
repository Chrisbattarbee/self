/*
 * (c) Copyright 2018 Palantir Technologies Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.chrisbattarbee.self.resources;

import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.chrisbattarbee.self.calories.CalorieService;
import com.chrisbattarbee.self.calories.MacroGoals;
import com.chrisbattarbee.self.calories.MealsForDay;
import com.palantir.logsafe.SafeArg;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class CalorieServiceResource extends SelfResource implements CalorieService {
    private static final String CALORIES_DYNAMO_TABLE = "self_api_calories";
    private static final String MACRO_GOALS_DYNAMO_TABLE = "self_api_macro_goals";
    private static final String TABLE_KEY = "date";
    private static final long READ_THROUGHPUT = 1L;
    private static final long WRITE_THROUGHPUT = 1L;
    private static final ProvisionedThroughput PROVISIONED_THROUGHPUT =
            new ProvisionedThroughput(READ_THROUGHPUT, WRITE_THROUGHPUT);

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Override
    void createDynamoTablesIfTheyDontExist() {
        super.getDynamoManager()
                .createDynamoTableIfItDoesntExist(CALORIES_DYNAMO_TABLE, TABLE_KEY, PROVISIONED_THROUGHPUT);
        super.getDynamoManager()
                .createDynamoTableIfItDoesntExist(MACRO_GOALS_DYNAMO_TABLE, TABLE_KEY, PROVISIONED_THROUGHPUT);
    }

    public CalorieServiceResource() {}

    @Override
    public void updateDailyCalories(MealsForDay updateDayRequest) {
        logger.info("Received request to update calories on {}", SafeArg.of("date", updateDayRequest.getDate()));
        super.getDynamoManager().putObjectIntoDynamo(CALORIES_DYNAMO_TABLE, updateDayRequest);
    }

    @Override
    public MealsForDay getDailyCalories(String date) {
        logger.info("Received request to get calories on {}", SafeArg.of("date", date));
        return super.getDynamoManager().getObjectFromDynamo(CALORIES_DYNAMO_TABLE, TABLE_KEY, date, MealsForDay.class);
    }

    @Override
    public List<MealsForDay> getDailyCaloriesInRange(String startDate, String endDate) {
        logger.info(
                "Received request to get calories between {} and {}",
                SafeArg.of("startDate", startDate),
                SafeArg.of("endDate", endDate));

        List<String> datesInRange = Utils.getDatesInRange(startDate, endDate);
        return super.getDynamoManager()
                .getObjectsFromDynamoBatched(CALORIES_DYNAMO_TABLE, TABLE_KEY, datesInRange, MealsForDay.class);
    }

    @Override
    public void updateDailyMacroGoals(MacroGoals updateMacroGoalsRequest) {
        logger.info(
                "Received request to update macro goals on {}", SafeArg.of("date", updateMacroGoalsRequest.getDate()));
        super.getDynamoManager().putObjectIntoDynamo(MACRO_GOALS_DYNAMO_TABLE, updateMacroGoalsRequest);
    }

    @Override
    public MacroGoals getDailyMacroGoals(String date) {
        logger.info("Received request to get macro goals on {}", SafeArg.of("date", date));
        return super.getDynamoManager()
                .getObjectFromDynamo(MACRO_GOALS_DYNAMO_TABLE, TABLE_KEY, date, MacroGoals.class);
    }

    @Override
    public List<MacroGoals> getDailyMacroGoalsInRange(String startDate, String endDate) {
        logger.info(
                "Received request to get macro goals between {} and {}",
                SafeArg.of("startDate", startDate),
                SafeArg.of("endDate", endDate));

        List<String> datesInRange = Utils.getDatesInRange(startDate, endDate);
        return super.getDynamoManager()
                .getObjectsFromDynamoBatched(MACRO_GOALS_DYNAMO_TABLE, TABLE_KEY, datesInRange, MacroGoals.class);
    }
}
