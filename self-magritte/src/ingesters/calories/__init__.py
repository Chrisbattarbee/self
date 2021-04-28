import logging
import time

import myfitnesspal
from ..ingest import IngestInterface
from self_api.self_calories import CalorieService, FoodEntry, Meal, MacroGoals, MealsForDay
from conjure_python_client import RequestsClient, ServiceConfiguration
import datetime

logger = logging.getLogger('magritte/calories')


class CalorieIngest(IngestInterface):
    def __init__(self, config):
        super().__init__(config)
        try:
            self.should_run_historical_job = config['calories']['should_run_historical_job'] == "true"
        except:
            self.should_run_historical_job = False
            logger.info("Calories: Could not find config for should_run_historical_job, setting to default of {}".format(self.should_run_historical_job))
        try:
            self.historical_job_from_date = datetime.date.fromisoformat(config['calories']['historical_job_from_date'])
        except:
            self.historical_job_from_date = datetime.date.fromisoformat("2015-01-01")
            logger.info("Calories: Could not find config for should_run_historical_job, setting to default of {}".format(self.historical_job_from_date))

        # Without these parameters, we can't do anything so we should just crash out
        self.self_api_client = self.get_self_api_calories_client(config['server_location'])
        self.mfp_client = myfitnesspal.Client(username=config['calories']['mfp_username'], password=config['calories']['mfp_password'])

    def run_job(self):
        if self.should_run_historical_job:
            self.run_historical_job()
        self.run_job_for_date(self.current_iso_date())

    def run_historical_job(self):
        date_to_run = self.historical_job_from_date
        while date_to_run != self.current_iso_date():
            try:
                self.run_job_for_date(date_to_run)
                date_to_run += datetime.timedelta(days=1)
                time.sleep(1)
            except Exception as e:
                # Could have ratelimit issues, wait a minute then try to continue
                logger.error(e)
                time.sleep(60)

    def get_logs_for_date(self, date):
        log = self.mfp_client.get_date(date)
        return log

    def run_job_for_date(self, iso_date):
        logs = self.get_logs_for_date(iso_date)
        meals_for_day, macro_goals = self.convert_mfp_day_logs_to_self_api_format(iso_date.isoformat(), logs)

        self.self_api_client.update_daily_calories(meals_for_day)
        logger.info("Updated calories for date {} with value {}.".format(iso_date.isoformat(), meals_for_day))
        self.self_api_client.update_daily_macro_goals(macro_goals)
        logger.info("Updated calories for date {} with value {}.".format(iso_date.isoformat(), macro_goals))

    @staticmethod
    def current_iso_date():
        return datetime.datetime.now().date()

    @staticmethod
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
                # The mfp api is sometimes odd about quantities and units, allowing them to be null
                # Our strongly typed api will reject this so we convert them to defaults here
                quantity = 1.0 if food_entry.quantity is None else float(food_entry.quantity)
                unit = "" if food_entry.unit is None else food_entry.unit
                food_entries.append(
                    FoodEntry(
                        name=food_entry.name,
                        quantity=quantity,
                        unit=unit,
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

    @staticmethod
    def get_self_api_calories_client(server_location):
        config = ServiceConfiguration()
        config.uris = [server_location]
        client = RequestsClient.create(CalorieService, user_agent="self-magritte", service_config=config)
        return client
