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

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.CreateTableRequest;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;
import com.chrisbattarbee.self.calories.CalorieService;
import com.chrisbattarbee.self.calories.MacroGoals;
import com.chrisbattarbee.self.calories.MealsForDay;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.palantir.logsafe.SafeArg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class CalorieServiceResource implements CalorieService {
    private static final String CALORIES_DYNAMO_TABLE_NAME = "self_api_calories";
    private static final String MACRO_GOALS_DYNAMO_TABLE_NAME = "self_api_macro_goals";
    private static final long READ_THROUGHPUT = 5L;
    private static final long WRITE_THROUGHPUT = 5L;
    private static final ProvisionedThroughput PROVISIONED_THROUGPUT =
            new ProvisionedThroughput(READ_THROUGHPUT, WRITE_THROUGHPUT);

    private final Logger logger = LoggerFactory.getLogger(CalorieServiceResource.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AmazonDynamoDB dynamoClient = AmazonDynamoDBClientBuilder.defaultClient();
    private final DynamoDB documentDynamoClient = new DynamoDB(dynamoClient);

    private void createDynamoTablesIfTheyDontExist() {
        if (!dynamoClient.listTables().getTableNames().contains(CALORIES_DYNAMO_TABLE_NAME)) {
            CreateTableRequest request = new CreateTableRequest()
                    .withAttributeDefinitions(new AttributeDefinition("date", ScalarAttributeType.S))
                    .withKeySchema(new KeySchemaElement("date", KeyType.HASH))
                    .withProvisionedThroughput(PROVISIONED_THROUGPUT)
                    .withTableName(CALORIES_DYNAMO_TABLE_NAME);
            dynamoClient.createTable(request);
            logger.info("Created dynamo table {}", SafeArg.of("table", CALORIES_DYNAMO_TABLE_NAME));
        }

        if (!dynamoClient.listTables().getTableNames().contains(MACRO_GOALS_DYNAMO_TABLE_NAME)) {
            CreateTableRequest request = new CreateTableRequest()
                    .withAttributeDefinitions(new AttributeDefinition("date", ScalarAttributeType.S))
                    .withKeySchema(new KeySchemaElement("date", KeyType.HASH))
                    .withProvisionedThroughput(PROVISIONED_THROUGPUT)
                    .withTableName(MACRO_GOALS_DYNAMO_TABLE_NAME);
            dynamoClient.createTable(request);
            logger.info("Created dynamo table {}", SafeArg.of("table", MACRO_GOALS_DYNAMO_TABLE_NAME));
        }
    }

    public CalorieServiceResource() {
        createDynamoTablesIfTheyDontExist();
    }

    @Override
    public void updateDailyCalories(MealsForDay updateDayRequest) {
        logger.info("Received request to update calories on {}", SafeArg.of("date", updateDayRequest.getDate()));
        Table calorieTable = documentDynamoClient.getTable(CALORIES_DYNAMO_TABLE_NAME);
        try {
            calorieTable.putItem(Item.fromJSON(objectMapper.writeValueAsString(updateDayRequest)));
            logger.info("Successfully put calorie item into dynamodb.");
        } catch (JsonProcessingException e) {
            logger.error("Failed to put calorie item into dynamodb.", e);
        }
    }

    @Override
    public void updateDailyMacroGoals(MacroGoals updateMacroGoalsRequest) {
        logger.info(
                "Received request to update macro goals on {}", SafeArg.of("date", updateMacroGoalsRequest.getDate()));
        Table macroGoalTable = documentDynamoClient.getTable(MACRO_GOALS_DYNAMO_TABLE_NAME);
        try {
            macroGoalTable.putItem(Item.fromJSON(objectMapper.writeValueAsString(updateMacroGoalsRequest)));
            logger.info("Successfully put macro goal item into dynamodb.");
        } catch (JsonProcessingException e) {
            logger.error("Failed to put macro goal item into dynamodb.", e);
        }
    }
}
