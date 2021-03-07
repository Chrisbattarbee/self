import myfitnesspal
from self_api.self_calories import CalorieService, FoodEntry, Meal, MacroGoals, MealsForDay
from conjure_python_client import RequestsClient, ServiceConfiguration
import datetime


def run_job(config):
    logs = get_logs_for_date(current_iso_date(), config['calories']['mfp_username'], config['calories']['mfp_password'])
    meals_for_day, macro_goals = convert_mfp_day_logs_to_self_api_format(current_iso_date().isoformat(),logs)
    self_api_client = get_self_api_calories_client(config['server_location'])

    self_api_client.update_daily_calories(meals_for_day)
    self_api_client.update_daily_macro_goals(macro_goals)
    print("Updated calories.")


def current_iso_date():
    return datetime.datetime.now().date()


def get_self_api_calories_client(server_location):
    config = ServiceConfiguration()
    config.uris = [server_location]
    client = RequestsClient.create(CalorieService, user_agent="self-magritte", service_config=config)
    return client


def get_logs_for_date(date, mfp_username, mfp_password):
    client = myfitnesspal.Client(username=mfp_username, password=mfp_password)
    log = client.get_date(date)
    return log


def convert_mfp_day_logs_to_self_api_format(date, day_logs):
    macro_goals = MacroGoals(
        calories=day_logs.goals['calories'],
        carbohydrates=day_logs.goals['carbohydrates'],
        fat=day_logs.goals['fat'],
        protein=day_logs.goals['protein'],
        sodium=day_logs.goals['sodium'],
        sugar=day_logs.goals['sugar'],
        date=date,
    )

    meals = []
    for meal in day_logs.meals:
        food_entries = []
        for food_entry in meal.entries:
            food_entries.append(
                FoodEntry(
                    name=food_entry.name,
                    quantity=food_entry.quantity,
                    unit=food_entry.unit,
                    calories=food_entry.totals['calories'],
                    carbohydrates=food_entry.totals['carbohydrates'],
                    fat=food_entry.totals['fat'],
                    protein=food_entry.totals['protein'],
                    sodium=food_entry.totals['sodium'],
                    sugar=food_entry.totals['sugar'],
                )
            )
        meals.append(
            Meal(
                name=meal.name,
                entries=food_entries,
            )
        )

    return MealsForDay(date=date,meals=meals), macro_goals
