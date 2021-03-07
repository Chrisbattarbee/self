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

import com.chrisbattarbee.self.calories.CalorieService;
import com.chrisbattarbee.self.calories.MacroGoals;
import com.chrisbattarbee.self.calories.Meal;
import com.palantir.logsafe.SafeArg;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class CalorieServiceResource implements CalorieService {
    private Logger logger = LoggerFactory.getLogger(CalorieServiceResource.class);

    public CalorieServiceResource() {
    }

    @Override
    public void updateDailyCalories(String date, List<Meal> updateDayRequest) {
        logger.info("{}", SafeArg.of("date", date));
        logger.info("{}", SafeArg.of("update", updateDayRequest.toString()));
    }

    @Override
    public void updateDailyMacroGoals(String date, MacroGoals updateMacroGoalsRequest) {
        logger.info("{}", SafeArg.of("date", date));
        logger.info("{}", SafeArg.of("goals", updateMacroGoalsRequest.toString()));
    }
}
