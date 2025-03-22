import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/match_data', methods=['GET'])
def match_data():
    match_id = request.args.get('match_id')

    if not match_id:
        return jsonify({'error': 'Match ID is needed'}), 400

    url = 'https://www.cricbuzz.com/live-cricket-scores/' + match_id

    response = requests.get(url)

    parser = BeautifulSoup(response.text, 'html.parser')

    data = {
        'team1': parser.find('div', class_='cb-col cb-col-100 cb-min-tm cb-text-gray').text.split(' ')[0],
        'score1': ' '.join(parser.find('div', class_='cb-col cb-col-100 cb-min-tm cb-text-gray').text.split(' ')[1:]),
        'team2': parser.find('div', class_='cb-col cb-col-100 cb-min-tm').text.split(' ')[0],
        'score2': ' '.join(parser.find('div', class_='cb-col cb-col-100 cb-min-tm').text.split(' ')[1:]),
        'result': parser.find('div', class_='cb-col cb-col-100 cb-min-stts cb-text-complete').text,
        'stadium': parser.find(attrs={'itemprop': 'location'})['title'],
        'player_of_match': parser.find('a', class_='cb-link-undrln').text
    }

    scorecard_endpoint = parser.find_all('a', class_='cb-nav-tab')[1]['href']

    scorecard = 'https://www.cricbuzz.com/live-cricket-scorecard/' + match_id + scorecard_endpoint[scorecard_endpoint.rfind('/'):]

    response = requests.get(scorecard)

    parser = BeautifulSoup(response.text, 'html.parser')

    players = {}

    for people in parser.find_all('div', class_='cb-col cb-col-100 cb-minfo-tm-nm'):
        role = people.find('div', class_='cb-col cb-col-27')
        if role != None:
            if role.text.strip() in ['Playing', 'Bench']:
                for player in people.find_all('a', class_='margin0 text-black text-hvr-underline'):
                    name = player.text.rstrip()
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
            ball_by_ball = requests.get('https://www.cricbuzz.com/' + \
                statline.find('a', class_='cb-ico cb-caret-right')['href'])
            ball_parser = BeautifulSoup(ball_by_ball.text, 'html.parser')
            wicket_counter = 0
            for ball in ball_parser.find_all('div', class_='cb-col cb-com-ln cb-col-90'):
                result = ' '.join(ball.text.split(', ')[1].split(' ')[:2])
                if result == 'no run' or result == 'leg byes':
                    players[name]['dots'] += 1
                if result.split(' ')[0] == 'out':
                    wicket_counter += 1
                    if not ('1 run' in ball.text or '2 run' in ball.text or '3 run' in ball.text):
                        players[name]['dots'] += 1
                else:
                    wicket_counter = 0
                if wicket_counter == 3:
                    players[name]['hat_tricks'] += 1
                    wicket_counter = 0

    players = {
        key.removesuffix(' (c & wk)')
        .removesuffix(' (wk)')
        .removesuffix(' (c)'): value
        for key, value in players.items()
    }
    data['players'] = players

    return jsonify(data)

if __name__ == '__main__':
    app.run()