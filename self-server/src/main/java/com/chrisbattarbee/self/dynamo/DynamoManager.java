package com.chrisbattarbee.self.dynamo;

import com.amazonaws.services.dynamodbv2.AmazonDynamoDB;
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder;
import com.amazonaws.services.dynamodbv2.document.DynamoDB;
import com.amazonaws.services.dynamodbv2.document.Item;
import com.amazonaws.services.dynamodbv2.document.PrimaryKey;
import com.amazonaws.services.dynamodbv2.document.Table;
import com.amazonaws.services.dynamodbv2.document.TableKeysAndAttributes;
import com.amazonaws.services.dynamodbv2.model.AttributeDefinition;
import com.amazonaws.services.dynamodbv2.model.CreateTableRequest;
import com.amazonaws.services.dynamodbv2.model.KeySchemaElement;
import com.amazonaws.services.dynamodbv2.model.KeyType;
import com.amazonaws.services.dynamodbv2.model.ProvisionedThroughput;
import com.amazonaws.services.dynamodbv2.model.ScalarAttributeType;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.palantir.logsafe.SafeArg;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class DynamoManager {
    private static DynamoManager instance;
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final AmazonDynamoDB dynamoClient = AmazonDynamoDBClientBuilder.defaultClient();
    private final DynamoDB documentDynamoClient = new DynamoDB(dynamoClient);

    private DynamoManager() {}

    public static DynamoManager getInstance() {
        if (instance == null) {
            instance = new DynamoManager();
        }
        return instance;
    }

    public <T> void putObjectIntoDynamo(String tableName, T object) {
        Table table = documentDynamoClient.getTable(tableName);
        Item jsonDynamoBlob = null;
        try {
            jsonDynamoBlob = Item.fromJSON(objectMapper.writeValueAsString(object));
        } catch (JsonProcessingException e) {
            logger.error("Could not encode object {} into json. Error: {}", SafeArg.of("object", object), e);
        }
        table.putItem(jsonDynamoBlob);
        logger.info(
                "Successfully inserted item {} into dynamodb table {}.",
                SafeArg.of("item", jsonDynamoBlob),
                SafeArg.of("table", tableName));
    }

    @SuppressWarnings("DangerousParallelStreamUsage")
    public <T> List<T> getObjectsFromDynamoBatched(
            String tableName, String keyName, List<String> keys, Class<T> objectType) {
        // Dynamo only allows batches of 100 at a time, so we need to partition our input into batches of 100 or less
        // then reassemble before returning
        return Lists.newArrayList(Iterables.concat(Lists.partition(keys, 100).parallelStream()
                .map(keyPartition -> {
                    TableKeysAndAttributes tableKeysAndAttributes = new TableKeysAndAttributes(tableName);
                    keyPartition.forEach(key -> {
                        tableKeysAndAttributes.addPrimaryKey(new PrimaryKey(keyName, key));
                    });
                    List<Item> items = documentDynamoClient
                            .batchGetItem(tableKeysAndAttributes)
                            .getTableItems()
                            .getOrDefault(tableName, new ArrayList<>());
                    List<T> retList = new ArrayList<>();
                    items.forEach(item -> {
                        try {
                            retList.add(objectMapper.readValue(item.toJSON(), objectType));
                        } catch (JsonProcessingException e) {
                            logger.error(
                                    "Could not decode json {} into objectType: {}. Error: {}",
                                    SafeArg.of("json", item.toJSON()),
                                    SafeArg.of("objectType", objectType),
                                    e);
                        }
                    });
                    return retList;
                })
                .collect(Collectors.toList())));
    }

    public <T> T getObjectFromDynamo(String tableName, String keyName, String key, Class<T> objectType) {
        Table table = documentDynamoClient.getTable(tableName);
        Item item = table.getItem(new PrimaryKey(keyName, key));
        if (item == null) {
            logger.error(
                    "Could not find requested object with {} = {} in dynamo.",
                    SafeArg.of("keyName", keyName),
                    SafeArg.of("key", key));
        }
        try {
            return objectMapper.readValue(item.toJSON(), objectType);
        } catch (JsonProcessingException e) {
            logger.error(
                    "Could not decode json {} into objectType: {}. Error: {}",
                    SafeArg.of("json", item.toJSON()),
                    SafeArg.of("objectType", objectType),
                    e);
        }
        return null;
    }

    public void createDynamoTableIfItDoesntExist(String tableName, String key, ProvisionedThroughput throughput) {
        if (!dynamoClient.listTables().getTableNames().contains(tableName)) {
            CreateTableRequest request = new CreateTableRequest()
                    .withAttributeDefinitions(new AttributeDefinition(key, ScalarAttributeType.S))
                    .withKeySchema(new KeySchemaElement(key, KeyType.HASH))
                    .withProvisionedThroughput(throughput)
                    .withTableName(tableName);
            dynamoClient.createTable(request);
            logger.info(
                    "Created dynamo table {}, key = {}, througput = {}",
                    SafeArg.of("table", tableName),
                    SafeArg.of("key", key),
                    SafeArg.of("throughput", throughput));
        }
    }
}
