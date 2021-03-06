import requests


def test():
    r = requests.get('https://google.com', )
    print(r.text)
