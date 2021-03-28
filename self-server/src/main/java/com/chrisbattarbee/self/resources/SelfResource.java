package com.chrisbattarbee.self.resources;

import com.chrisbattarbee.self.dynamo.DynamoManager;

public abstract class SelfResource {
    private DynamoManager dynamoManager = DynamoManager.getInstance();

    /**
     * Returns a manager for dynamo.
     * @return manager for dynamo
     */
    public DynamoManager getDynamoManager() {
        return dynamoManager;
    }

    abstract void createDynamoTablesIfTheyDontExist();

    public SelfResource() {
        createDynamoTablesIfTheyDontExist();
    }
}
