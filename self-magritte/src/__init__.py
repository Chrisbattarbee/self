from .ingesters.calories import CalorieIngest
from .ingesters.workouts import WorkoutIngest
from .utils.ssm_parameter_store import SSMParameterStore
import schedule
import time


def main():
    config = SSMParameterStore("/self")

    job = CalorieIngest.run_job
    calorie_ingest = CalorieIngest(config)
    eval(config['calories']['when'])

    job = WorkoutIngest.run_job
    calorie_ingest = CalorieIngest(config)
    eval(config['workouts']['when'])

    schedule.run_all()
    while True:
        time.sleep(10)
        schedule.run_pending()


main()