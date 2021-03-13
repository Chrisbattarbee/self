package com.chrisbattarbee.self.resources;

public abstract class SelfResource {
     abstract void createDynamoTablesIfTheyDontExist();

     public SelfResource() {
         createDynamoTablesIfTheyDontExist();
     }
}
