class IngestInterface():
    def __init__(self, config):
        """Construct an ingester from the global config file."""
        pass

    def run_job(self):
        """Ingest the data for a time period."""
        pass

    def run_historical_job(self):
        """Should gather all historical data for the ingested service."""
        pass