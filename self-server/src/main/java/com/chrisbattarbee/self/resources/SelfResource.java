package com.chrisbattarbee.self.resources;

import com.chrisbattarbee.self.dynamo.DynamoManager;

public abstract class SelfResource {
    public DynamoManager dynamoManager = DynamoManager.getInstance();

    abstract void createDynamoTablesIfTheyDontExist();

    public SelfResource() {
        createDynamoTablesIfTheyDontExist();
    }
}
