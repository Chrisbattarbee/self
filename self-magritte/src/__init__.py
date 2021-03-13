from ingesters.calories import CalorieIngest
import json
import schedule
import time
import sys


def main():
    config = {}
    with open(sys.argv[1]) as json_config:
        config = json.load(json_config)

    job = CalorieIngest.run_job
    calorie_ingest = CalorieIngest(config)
    eval(config['calories']['when'])

    schedule.run_all()
    while True:
        time.sleep(10)
        schedule.run_pending()


main()