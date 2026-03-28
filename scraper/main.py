import requests
from bs4 import BeautifulSoup
import json
import time
import os
from dotenv import load_dotenv

def lambda_handler(event, context):

    start_time = time.perf_counter()

    load_dotenv()
    api_url = os.environ.get('API_URL')

    current = requests.get(api_url + "/api/admin/current")

    if len(current.json()) == 0:
        print('No Updates')

    for match_id in current.json():
        url = 'https://www.cricbuzz.com/live-cricket-scores/' + str(match_id)

        response = requests.get(url)

        parser = BeautifulSoup(response.text, 'html.parser')

        teams = {
            'Royal Challengers Bengaluru': 'RCB',
            'Chennai Super Kings': 'CSK',
            'Mumbai Indians': 'MI',
            'Kolkata Knight Riders': 'KKR',
            'Punjab Kings': 'PBKS',
            'Rajasthan Royals': 'RR',
            'Delhi Capitals': 'DC',
            'Sunrisers Hyderabad': 'SRH',
            'Gujarat Titans': 'GT',
            'Lucknow Super Giants': 'LSG'
        }

        no_result = 'No result' in parser.find_all('div', class_='text-cbTextLink')[0].text
        one_team = parser.find_all('div', class_='mr-2')[0].find_next_sibling('div') == None

        finished = parser.find('div', class_='rounded-full overflow-hidden border border-solid border-gray-400 w-avatar')
        second_innings = parser.find_all('div', class_='mr-2')[1].find_next_sibling('div')
        playing = [teams[i] for i in parser.find('span', class_='min-w-0 break-words').text.split(',')[0].split(' vs ')]

        data = {
            'match_id': match_id,
            'team1': parser.find_all('div', class_='mr-2')[1].text if one_team else parser.find_all('div', class_='mr-2')[0].text,
            'score1': parser.find_all('div', class_='mr-2')[1].find_next_sibling('div').text if one_team else parser.find_all('div', class_='mr-2')[0].find_next_sibling('div').text,
            'team2': (playing[0] if playing[1] == parser.find_all('div', class_='mr-2')[0].text else playing[1]) if second_innings is None else parser.find_all('div', class_='mr-2')[1].text,
            'score2': '-' if second_innings is None else second_innings.text,
            'result': 'No Result' if no_result else 'LIVE' if finished == None else teams[parser.find_all('div', class_='text-cbTextLink')[0].text.split(' won')[0]] + ' won' + parser.find_all('div', class_='text-cbTextLink')[0].text.split(' won')[1].replace('wkts', 'wickets').split('-')[0],
            'stadium': parser.find_all('a', class_='hover:underline')[1].text.split(', ')[1],
            'player_of_match': '-' if finished == None else finished.find_next_sibling().text
        }

        scorecard = 'https://www.cricbuzz.com/live-cricket-scorecard/' + str(match_id)

        response = requests.get(scorecard)

        parser = BeautifulSoup(response.text, 'html.parser')

        players = {}

        for header in parser.find_all('div', class_='font-bold'):
            label = header.get_text(strip=True)
            if label in ['Players', 'Bench']:
                next_div = header.find_next_sibling('div')
                if next_div and 'flex' in next_div.get('class', []) and \
                'flex-wrap' in next_div.get('class', []) and \
                'gap-1' in next_div.get('class', []):
                    for child in next_div.find_all(recursive=False):
                        name = child.text.rstrip().replace('(c) (wk)', '(c & wk)')
                        if name[-1] == ',':
                            name = name[:-1]
                        if ',' not in name:
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
            if name[0:5] == '(sub)':
                name = name[5:]
            if name not in players:
                for key in players.keys():
                    names = name.split(' ')
                    same = True
                    for part in names:
                        same = same and part in key
                    if same:
                        name = key
            return name

        added = set()
        for batting_stats in parser.find_all('div', class_='grid scorecard-bat-grid p-2 border-b border-solid border-cbBorderGrey tb:scorecard-bat-grid-web wb:text-sm wb:scorecard-bat-grid-web'):
            name = batting_stats.find('a', class_='text-cbTextLink hover:underline text-sm tb:text-xs wb:text-sm')
            if name is not None and name not in added:
                added.add(name)
                name = get_name(name.text)
                status = batting_stats.find('div', class_='tb:w-3/5 wb:w-3/5 text-cbTxtSec wb:text-xs').text
                if status == 'not out':
                    players[name]['not_out'] = True
                elif status != 'retd hurt':
                    players[name]['out'] = True
                    if status[0] == 'c':
                        if status.split(' ')[1] == 'and':
                            players[get_name(status[8:])]['catches'] += 1
                        else:
                            players[get_name(status[2:].split(' b')[0])]['catches'] += 1
                    elif status[0] == 's':
                        players[get_name(status[3:].split(' b')[0])]['stumpings'] += 1
                players[name]['runs'] = int(batting_stats.find('div', class_='flex justify-center items-center font-bold text-sm wb:text-sm').text)
                players[name]['balls_faced'] = int(batting_stats.find_all('div', class_='flex justify-center items-center')[0].text)
                players[name]['fours'] = int(batting_stats.find_all('div', class_='flex justify-center items-center')[1].text)
                players[name]['sixes'] = int(batting_stats.find_all('div', class_='flex justify-center items-center')[2].text)

        added = set()
        for bowling_stats in parser.find_all('div', class_='grid scorecard-bowl-grid p-2 border-b border-solid border-cbBorderGrey tb:scorecard-bowl-grid-web wb:scorecard-bowl-grid-web text-sm'):
            name = bowling_stats.find('a', class_='text-cbTextLink hover:underline text-sm tb:text-xs wb:text-sm')
            if name is not None and name not in added:
                added.add(name)
                name = get_name(name.text)
                players[name]['wickets'] = int(bowling_stats.find('div', class_='flex justify-center items-center font-bold').text)
                overs = bowling_stats.find_all('div', class_='flex justify-center items-center')[0].text
                players[name]['balls_bowled'] = int(overs) * 6 if len(overs) == 1 else int(overs[0]) * 6 + int(overs[2])
                players[name]['maidens'] = int(bowling_stats.find_all('div', class_='flex justify-center items-center')[1].text)
                players[name]['runs_conceded'] = int(bowling_stats.find_all('div', class_='flex justify-center items-center')[2].text)
                ball_by_ball = requests.get('https://www.cricbuzz.com/' + bowling_stats.find('a', class_='flex justify-center items-center')['href'])
                ball_parser = BeautifulSoup(ball_by_ball.text, 'html.parser')
                wickets = 0
                for ball in ball_parser.find_all('div', class_='flex gap-4 wb:gap-6 mx-4 wb:mx-4 py-2 border-t border-dotted border-cbChineseSilver wb:border-0'):
                    result = ball.text.split(',')[1].strip()
                    if result == 'no run' or result == 'byes' or result == 'leg byes':
                        players[name]['dots'] += 1
                    if result.split(' ')[0] == 'out':
                        if 'Run Out' not in ball.text:
                            wickets += 1
                        else:
                            wickets = 0
                        if not ('1 run' in ball.text or '2 run' in ball.text or '3 run' in ball.text):
                            players[name]['dots'] += 1
                    else:
                        wickets = 0
                    if wickets == 3:
                        players[name]['hat_tricks'] += 1
                        wickets = 0

        players = {
            key.removesuffix(' (c & wk)')
            .removesuffix(' (wk)')
            .removesuffix(' (c)'): value
            for key, value in players.items()
        }

        with open('names.json', 'r') as file:
            names = json.load(file)
            players = { 
                (names[key] if key in names else key): value for key, value in players.items()
            }
            if data['player_of_match'] in names:
                data['player_of_match'] = names[data['player_of_match']]

        data['scorecard'] = players

        response = requests.post(api_url + "/api/admin/update", json=data)

        print(response.status_code)
        print(response.json())

        print('Completed in ' + str(time.perf_counter() - start_time) + ' seconds')

    return { 'statusCode': 200 }

print(lambda_handler(None, None))