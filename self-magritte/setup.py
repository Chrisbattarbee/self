from setuptools import setup, find_packages
setup(
    name='self-magritte',
    version='0.0.1',
    package_dir={'self_magritte': 'src'},
    packages=['self_magritte', 'self_magritte.utils', 'self_magritte.ingesters', 'self_magritte.ingesters.calories', 'self_magritte.ingesters.workouts']
)
