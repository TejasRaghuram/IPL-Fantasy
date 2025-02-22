import requests
from bs4 import BeautifulSoup

MATCH_ID = '114960'

url = 'https://www.cricbuzz.com/live-cricket-scores/' + MATCH_ID

response = requests.get(url)

scraper = BeautifulSoup(response.text, 'html.parser')

print(scraper.text)