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
import java.util.List;

public final class CalorieServiceResource implements CalorieService {
    public CalorieServiceResource() {
    }

    @Override
    public void updateDailyCalories(String date, List<Meal> updateDayRequest) {
        System.out.println(date);
        System.out.println(updateDayRequest.toString());
    }

    @Override
    public void updateDailyMacroGoals(String date, MacroGoals updateMacroGoalsRequest) {
        System.out.println(date);
        System.out.println(updateMacroGoalsRequest.toString());
    }
}
