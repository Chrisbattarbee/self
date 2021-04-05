import datetime
from conjure_python_client import ServiceConfiguration, RequestsClient
from self_api.self_workouts import WorkoutService, Workout, Set, Exercise
from typing import Dict

from ..ingest import IngestInterface
import time
import subprocess
import json


class WorkoutIngest(IngestInterface):
    """
    This ingester calls a node subprocess which in turn prints the result of jefit workouts.
    We then parse the
    """

    def __init__(self, config):
        super().__init__(config)
        try:
            self.should_run_historical_job = config['workouts']['should_run_historical_job'] == "true"
        except:
            self.should_run_historical_job = False
            print("Workouts: Could not find config for should_run_historical_job, setting to default of {}".format(self.should_run_historical_job))
        try:
            self.historical_job_from_date = datetime.date.fromisoformat(config['workouts']['historical_job_from_date'])
        except:
            self.historical_job_from_date = datetime.date.fromisoformat("2015-01-01")
            print("Workouts: Could not find config for should_run_historical_job, setting to default of {}".format(self.historical_job_from_date))

        # Without these parameters, we can't do anything so we should just crash out
        self.self_api_client = self.get_self_api_workouts_client("http://localhost:8000")
        self.jefit_username = config['workouts']['jefit_username']

    @staticmethod
    def current_iso_date():
        return datetime.datetime.now().date()

    def run_job(self):
        if self.should_run_historical_job:
            self.run_historical_job()
        self.run_job_for_date(self.current_iso_date())


    @staticmethod
    def convert_jefit_workout_logs_to_self_api_format(date, jefit_logs: Dict):
        exercises = []
        for exercise_log in jefit_logs.get("exercises" , []):
            sets = []
            for set_log in exercise_log.get("sets", []):
                sets.append(
                    Set(
                        index=set_log.get("index", 0) or 0,
                        reps=set_log.get("reps", 0) or 0,
                        weight=float(set_log.get("weight", 0.0)) or 0.0,
                    )
                )
            exercises.append(
                Exercise(
                    name=exercise_log.get("name", "") or "",
                    one_rep_max=float(exercise_log.get("oneRepMax", 0.0) or 0.0),
                    type=exercise_log.get("type", "lift") or "lift",
                    sets=sets
                )
            )
        return Workout(
            date=date,
            exercises=exercises,
            rest_timer=jefit_logs.get("restTimer", 0) or 0,
            session_length=jefit_logs.get("sessionLength", 0) or 0,
            actual_workout_length=jefit_logs.get("actualWorkout", 0) or 0,
            wasted_time=jefit_logs.get("wastedTime", 0) or 0,
            total_weight_lifted=jefit_logs.get("weightLifted", 0) or 0
        )

    def run_historical_job(self):
        date_to_run = self.historical_job_from_date
        while date_to_run != self.current_iso_date():
            try:
                self.run_job_for_date(date_to_run.isoformat())
                date_to_run += datetime.timedelta(days=1)
                time.sleep(1)
            except Exception as e:
                # Could have ratelimit issues, wait a minute then try to continue
                print(e)
                time.sleep(60)

    def run_job_for_date(self, date):
        """
        Runs the node subprocess for a date, grabs the json output, converts it into a Workout object and pushes that
        to the api.
        :param date: The date to get the information for
        """
        result = subprocess.run(['node', 'src/ingesters/workouts/node/index.js', self.jefit_username, date], stdout=subprocess.PIPE)
        workout_logs_for_day_dict = json.loads(result.stdout)
        self_api_workout = self.convert_jefit_workout_logs_to_self_api_format(date, workout_logs_for_day_dict)
        self.self_api_client.update_daily_workout(self_api_workout)
        print("Updated workout for date {} with value {}.".format(date, self_api_workout))

    @staticmethod
    def get_self_api_workouts_client(server_location):
        config = ServiceConfiguration()
        config.uris = [server_location]
        client = RequestsClient.create(WorkoutService, user_agent="self-magritte", service_config=config)
        return client
