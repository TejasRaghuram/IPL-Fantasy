import requests
from bs4 import BeautifulSoup
from pprint import pprint

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
scorecard = 'https://www.cricbuzz.com/live-cricket-scorecard' + parser.find_all('a', class_='cb-nav-tab')[1]['href'][20:]

print('Team 1:', team1)
print('Score 1:', score1)
print('Team 2:', team2)
print('Score 2:', score2)
print('Result:', result)
print('Stadium:', stadium)
print('Man of Match:', man_of_match)
print('Scorecard: ', scorecard)


response = requests.get(scorecard)

parser = BeautifulSoup(response.text, 'html.parser')

players = {}

for people in parser.find_all('div', class_='cb-col cb-col-100 cb-minfo-tm-nm'):
    role = people.find('div', class_='cb-col cb-col-27')
    if role != None:
        if role.text.strip() in ['Playing', 'Bench']:
            for player in people.find_all('a', class_='margin0 text-black text-hvr-underline'):
                name = player.text
                if player.text.endswith(" (wk)"):
                    name =  name.removesuffix(" (wk)")
                elif player.text.endswith(" (c)"):
                    name = name.removesuffix(" (c)")
                players[name] = {
                    'runs': 0,
                    'fours': 0,
                    'sixes': 0,
                    'balls_faced': 0,
                    'not_out': False,
                    'out': False,
                    'wickets': 0,
                    'dots': 0,
                    'maidens': 0,
                    'hat_tricks': 0,
                    'balls_bowled': 0,
                    'runs_conceded': 0,
                    'catches': 0,
                    'stumpings': 0
                }

def get_name(name):
    if name.endswith(" (wk)"):
        name =  name.removesuffix(" (wk)")
    elif name.endswith(" (c)"):
        name = name.removesuffix(" (c)")
    if name not in players:
        for key, value in players.items():
            names = name.split(' ')
            same = True
            for part in names:
                same = same and part in key
            if same:
                name = key
    return name

for statline in parser.find_all('div', class_='cb-col cb-col-100 cb-scrd-itms'):
    name = statline.find('a', class_='cb-text-link')
    batting = statline.find('span', class_='text-gray') != None
    bowling = statline.find('div', class_='cb-col cb-col-8 text-right text-bold') != None and not batting
    playing = batting or bowling
    if playing:
        name = get_name(name.text[1:].strip())
    if batting:
        status = statline.find('span', class_='text-gray').text
        if status == 'not out':
            players[name]['not_out'] = True
        else:
            players[name]['out'] = True
            if status[0] == 'c':
                players[get_name(status[2:].split(' b')[0])]['catches'] += 1
            elif status[0] == 's':
                players[get_name(status[3:].split(' b')[0])]['stumpings'] += 1
        players[name]['runs'] += int(statline.find('div', class_='cb-col cb-col-8 text-right text-bold').text)
        stats = statline.find_all('div', class_='cb-col cb-col-8 text-right')
        players[name]['balls_faced'] = int(stats[0].text)
        players[name]['fours'] = int(stats[1].text)
        players[name]['sixes'] = int(stats[2].text)    
    elif bowling:
        players[name]['wickets'] = int(statline.find('div', class_='cb-col cb-col-8 text-right text-bold').text)
        stats = statline.find_all('div', class_='cb-col cb-col-8 text-right')
        players[name]['balls_bowled'] = \
            int(stats[0].text) * 6 if len(stats[0].text) == 1 else int(stats[0].text[0]) * 6 + int(stats[0].text[2])
        players[name]['maidens'] = int(stats[1].text)
        players[name]['runs_conceded'] = int(statline.find('div', class_='cb-col cb-col-10 text-right').text)

pprint(players)