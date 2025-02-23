import requests
from bs4 import BeautifulSoup

MATCH_ID = '114960'

url = 'https://www.cricbuzz.com/live-cricket-scores/' + MATCH_ID

response = requests.get(url)

parser = BeautifulSoup(response.text, 'html.parser')

team1 = parser.find('div', class_='cb-col cb-col-100 cb-min-tm cb-text-gray').text.split(' ')[0]
score1 = ' '.join(parser.find('div', class_='cb-col cb-col-100 cb-min-tm cb-text-gray').text.split(' ')[1:])
team2 = parser.find('div', class_='cb-col cb-col-100 cb-min-tm').text.split(' ')[0]
score2 = ' '.join(parser.find('div', class_='cb-col cb-col-100 cb-min-tm').text.split(' ')[1:])
result = parser.find('div', class_='cb-col cb-col-100 cb-min-stts cb-text-complete').text
stadium = parser.find(attrs={'itemprop': 'location'})['title']
man_of_match = parser.find('a', class_='cb-link-undrln').text
scorecard = 'https://www.cricbuzz.com' + parser.find_all('a', class_='cb-nav-tab')[1]['href']

print('Team 1:', team1)
print('Score 1:', score1)
print('Team 2:', team2)
print('Score 2:', score2)
print('Result:', result)
print('Stadium:', stadium)
print('Man of Match:', man_of_match)
print('Scorecard: ', scorecard)