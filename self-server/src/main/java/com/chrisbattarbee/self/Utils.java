package com.chrisbattarbee.self;

import java.lang.annotation.Annotation;

public class Utils {
    public static void addMapperAnnotationsToConjureClass(Class conjureClass) {
        Annotation[] DynamoDBTable = com.amazonaws.services.dynamodbv2.datamodeling.DynamoDBTable.class.getAnnotations();
    }
}
