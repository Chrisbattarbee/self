import logging

from .ingesters.calories import CalorieIngest
from .ingesters.workouts import WorkoutIngest
from .utils.ssm_parameter_store import SSMParameterStore
import schedule
import time


logging.basicConfig(
    format='%(asctime)s %(levelname)-8s %(message)s',
    level=logging.INFO,
    datefmt='%Y-%m-%d %H:%M:%S'
)
logging.root.setLevel(logging.INFO)


def main():
    config = SSMParameterStore("/self")

    job = CalorieIngest.run_job
    calorie_ingest = CalorieIngest(config)
    eval(config['calories']['when'])

    job = WorkoutIngest.run_job
    workout_ingest = WorkoutIngest(config)
    eval(config['workouts']['when'])

    schedule.run_all()
    while True:
        time.sleep(10)
        schedule.run_pending()


main()