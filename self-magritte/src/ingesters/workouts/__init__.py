import datetime
from conjure_python_client import ServiceConfiguration, RequestsClient
from self_api.self_calories import CalorieService
from ..ingest import IngestInterface

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
            self.historical_job_from_date = datetime.date.fromisoformat(config['calories']['historical_job_from_date'])
        except:
            self.historical_job_from_date = datetime.date.fromisoformat("2015-01-01")
            print("Workouts: Could not find config for should_run_historical_job, setting to default of {}".format(self.historical_job_from_date))

        # Without these parameters, we can't do anything so we should just crash out
        self.self_api_client = self.get_self_api_workouts_client(config['server_location'])

    def run_job(self):
        raise NotImplementedError()

    def run_historical_job(self, from_date):
        raise NotImplementedError()

    @staticmethod
    def get_self_api_workouts_client(server_location):
        config = ServiceConfiguration()
        config.uris = [server_location]
        client = RequestsClient.create(CalorieService, user_agent="self-magritte", service_config=config)
        return client
