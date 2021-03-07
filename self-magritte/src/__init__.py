import self_magritte.calories
import json
import schedule
import time

def main(config_path):
    config = {}
    with open(config_path) as json_config:
        config = json.load(json_config)

    job = calories.run_job
    eval(config['calories']['when'])

    while True:
        try:
            schedule.run_pending()
            time.sleep(10)
        except:
            print("Couldn't execute a job")