package com.chrisbattarbee.self.ssm;

import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagement;
import com.amazonaws.services.simplesystemsmanagement.AWSSimpleSystemsManagementClientBuilder;
import com.amazonaws.services.simplesystemsmanagement.model.GetParameterRequest;
import com.amazonaws.services.simplesystemsmanagement.model.GetParameterResult;
import com.palantir.logsafe.SafeArg;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class SimpleSystemsManagementManager {
    private final AWSSimpleSystemsManagement ssmClient = AWSSimpleSystemsManagementClientBuilder.defaultClient();
    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private static SimpleSystemsManagementManager instance;

    private SimpleSystemsManagementManager() {}

    public SimpleSystemsManagementManager getInstance() {
        if (instance == null) {
            instance = new SimpleSystemsManagementManager();
        }
        return instance;
    }

    public String getParameter(String parameterName) {
        logger.info("Attempting to get parameter: {} from SSM.", SafeArg.of("parameterName", parameterName));
        GetParameterRequest request = new GetParameterRequest().withName(parameterName);
        GetParameterResult result = ssmClient.getParameter(request);
        return result.getParameter().getValue();
    }
}
