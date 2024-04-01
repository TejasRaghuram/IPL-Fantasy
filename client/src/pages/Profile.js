import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from './../UserContext.js';
import { useContext, useState, useEffect } from 'react';
import './../styles/Profile.css';

function Profile() {
    const params = useParams();
    const navigate = useNavigate();
    const user = useContext(UserContext);
    const [content, setContent] = useState(<p>Loading...</p>);
    const [image, setImage] = useState('https://scores.iplt20.com/ipl/images/default-player-statsImage.png?v=4');

    useEffect(() => {
        const name = params.player.replaceAll('%20', ' ');
        fetch('https://ipl-fantasy-api.onrender.com/api/players/get', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({name})
        })
            .then(response => response.json())
            .then(json => {
                try {
                    

                    var run_points = 0;
                    if(json.runs >= 850) run_points = 5000;
                    else if(json.runs >= 800) run_points = 4500;
                    else if(json.runs >= 750) run_points = 4000;
                    else if(json.runs >= 700) run_points = 3500;
                    else if(json.runs >= 650) run_points = 3000;
                    else if(json.runs >= 600) run_points = 2500;
                    else if(json.runs >= 550) run_points = 2000;
                    else if(json.runs >= 500) run_points = 1500;
                    else if(json.runs >= 450) run_points = 1000;
                    else if(json.runs >= 400) run_points = 750;
                    else if(json.runs >= 350) run_points = 500;
                    else if(json.runs >= 300) run_points = 250;
                    var strike_rate_points = 0;
                    if(json.balls_faced > 15)
                    {
                        if(json.strike_rate > 200) strike_rate_points = 1000;
                        else if(json.strike_rate > 175) strike_rate_points = 800;
                        else if(json.strike_rate > 150) strike_rate_points = 600;
                        else if(json.strike_rate > 125) strike_rate_points = 400;
                        else if(json.strike_rate > 100) strike_rate_points = 200;
                        else if(json.strike_rate > 75) strike_rate_points = -100;
                        else if(json.strike_rate > 50) strike_rate_points = -200;
                        else if(json.strike_rate > 25) strike_rate_points = -300;
                        else strike_rate_points = -500;
                        if(json.position === 'Bowler') strike_rate_points = strike_rate_points > 0 ? strike_rate_points * 2: strike_rate_points / 2;
                    }
                    var wicket_points = 0;
                    if(json.wickets >= 35) wicket_points = 5000;
                    else if(json.wickets >= 30) wicket_points = 4000;
                    else if(json.wickets >= 25) wicket_points = 3000;
                    else if(json.wickets >= 20) wicket_points = 2000;
                    else if(json.wickets >= 15) wicket_points = 1000;
                    var economy_points = 0;
                    if(json.balls_bowled >= 30)
                    {
                        if(json.economy > 11) economy_points = -500;
                        else if(json.economy > 10) economy_points = -400;
                        else if(json.economy > 9) economy_points = -200;
                        else if(json.economy > 8) economy_points = -100;
                        else if(json.economy > 6) economy_points = 100;
                        else if(json.economy > 5) economy_points = 250;
                        else if(json.economy > 4) economy_points = 500;
                        else if(json.economy > 3) economy_points = 800;
                        else if(json.economy > 2) economy_points = 1200;
                        else if(json.economy > 1) economy_points = 1500;
                        else economy_points = 2000;
                        if(json.position === 'Batsman') economy_points = economy_points > 0 ? economy_points * 2: economy_points / 2;
                    }

                    var bonuses = [];
                    for(var i = 0; i < json.bonuses.length; i++)
                    {
                        var bonus = json.bonuses[i].replaceAll('_', ' ');
                        for(var j = 0; j < bonus.length; j++)
                        {
                            if(j === 0 || bonus.charAt(j - 1) === ' ')
                            {
                                bonus = bonus.substring(0, j) + bonus.charAt(j).toUpperCase() + bonus.substring(j + 1);
                            }
                        }
                        const best = [
                            'Strike Rate',
                            'Batting Average',
                            'Highest Score',
                            'Economy',
                            'Bowling Average'
                        ];
                        if(best.includes(bonus))
                        {
                            bonus = 'Best ' + bonus;
                        }
                        else
                        {
                            bonus = 'Most ' + bonus;
                        }
                        bonuses.push(
                            <tr class={i % 2 === 0 ? 'profile-table-odd':'profile-table-even'}>
                                <td class='profile-table-element'>{bonus}</td>
                                <td class='profile-table-element'>{json.bonuses_points[i]}</td>
                            </tr>
                        );
                    }

                    const check = new Image();
                    check.src = 'https://scores.iplt20.com/ipl/playerimages/' + params.player + '.png';
                    check.onload = () => {
                        setImage(check.src);
                    };

                    setContent(
                        <div>
                            <div id='profile-card'>
                                <img id='profile-image' src={image} alt=''/>
                                <div id='profile-gradient'/>
                                <h2 id='profile-name'>{name}</h2>
                                <p id='profile-position'>{json.position}</p> 
                                <h3 class='profile-header'>Batting Stats</h3>
                                <table class='profile-table'>
                                    <tr class='profile-table-header'>
                                        <th class='profile-table-element'>Name</th>
                                        <th class='profile-table-element'>Amount</th>
                                        <th class='profile-table-element'>Points</th>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Runs</td>
                                        <td class='profile-table-element'>{json.runs}</td>
                                        <td class='profile-table-element'>{json.position === 'Bowler' ? json.runs*4:json.runs*2} + {json.position === 'Bowler' ? run_points*2:run_points}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Fours</td>
                                        <td class='profile-table-element'>{json.fours}</td>
                                        <td class='profile-table-element'>{json.position === 'Bowler' ? json.fours*8:json.fours*4}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Sixes</td>
                                        <td class='profile-table-element'>{json.sixes}</td>
                                        <td class='profile-table-element'>{json.position === 'Bowler' ? json.sixes*16:json.sixes*8}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Ducks</td>
                                        <td class='profile-table-element'>{json.ducks}</td>
                                        <td class='profile-table-element'>{json.position === 'Bowler' ? json.ducks*-3:json.ducks*-6}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Half Centuries</td>
                                        <td class='profile-table-element'>{json.half_centuries}</td>
                                        <td class='profile-table-element'>{json.position === 'Bowler' ? json.half_centuries*100:json.half_centuries*50}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Centuries</td>
                                        <td class='profile-table-element'>{json.centuries}</td>
                                        <td class='profile-table-element'>{json.position === 'Bowler' ? json.centuries*200:json.centuries*100}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Strike Rate</td>
                                        <td class='profile-table-element'>{json.balls_faced > 0 ? json.strike_rate:'-'}</td>
                                        <td class='profile-table-element'>{strike_rate_points}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Balls Faced</td>
                                        <td class='profile-table-element'>{json.balls_faced}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Batting Average</td>
                                        <td class='profile-table-element'>{json.balls_faced > 0 ? json.batting_average:'-'}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Not Outs</td>
                                        <td class='profile-table-element'>{json.not_outs}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Dismissals</td>
                                        <td class='profile-table-element'>{json.dismissals}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Highest Score</td>
                                        <td class='profile-table-element'>{json.balls_faced > 0 ? json.highest_score:'-'}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                </table>
                                <h3 class='profile-header'>Bowling Stats</h3>
                                <table class='profile-table'>
                                    <tr class='profile-table-header'>
                                        <th class='profile-table-element'>Name</th>
                                        <th class='profile-table-element'>Amount</th>
                                        <th class='profile-table-element'>Points</th>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Wickets</td>
                                        <td class='profile-table-element'>{json.wickets}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.wickets*100:json.wickets*50} + {json.position === 'Batsman' ? wicket_points*2:wicket_points}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Dots</td>
                                        <td class='profile-table-element'>{json.dots}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.dots*10:json.dots*5}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Four Wicket Hauls</td>
                                        <td class='profile-table-element'>{json.four_wicket_hauls}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.four_wicket_hauls*500:json.four_wicket_hauls*250}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Five Wicket Hauls</td>
                                        <td class='profile-table-element'>{json.five_wicket_hauls}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.five_wicket_hauls*1000:json.five_wicket_hauls*500}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Six Wicket Hauls</td>
                                        <td class='profile-table-element'>{json.six_wicket_hauls}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.six_wicket_hauls*2000:json.six_wicket_hauls*1000}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Maidens</td>
                                        <td class='profile-table-element'>{json.maidens}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.maidens*300:json.maidens*150}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Hat Tricks</td>
                                        <td class='profile-table-element'>{json.hat_tricks}</td>
                                        <td class='profile-table-element'>{json.position === 'Batsman' ? json.hat_tricks*1500:json.hat_tricks*750}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Economy</td>
                                        <td class='profile-table-element'>{json.balls_bowled > 0 ? json.economy:'-'}</td>
                                        <td class='profile-table-element'>{economy_points}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Bowling Average</td>
                                        <td class='profile-table-element'>{json.balls_bowled > 0 ? json.bowling_average:'-'}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Balls Bowled</td>
                                        <td class='profile-table-element'>{json.balls_bowled}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Runs Conceded</td>
                                        <td class='profile-table-element'>{json.runs_conceded}</td>
                                        <td class='profile-table-element'>N/A</td>
                                    </tr>
                                </table>
                                <h3 class='profile-header'>General Stats</h3>    
                                <table class='profile-table'>
                                    <tr class='profile-table-header'>
                                        <th class='profile-table-element'>Name</th>
                                        <th class='profile-table-element'>Amount</th>
                                        <th class='profile-table-element'>Points</th>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Catches</td>
                                        <td class='profile-table-element'>{json.catches}</td>
                                        <td class='profile-table-element'>{json.catches * 25}</td>
                                    </tr>
                                    <tr class='profile-table-even'>
                                        <td class='profile-table-element'>Stumpings</td>
                                        <td class='profile-table-element'>{json.stumpings}</td>
                                        <td class='profile-table-element'>{json.stumpings * 50}</td>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>Man of the Match Awards</td>
                                        <td class='profile-table-element'>{json.man_of_matches}</td>
                                        <td class='profile-table-element'>{json.man_of_matches * 100}</td>
                                    </tr>
                                </table>
                                {bonuses.length > 0 && 
                                    <div>
                                        <h3 class='profile-header'>Bonus Points</h3>
                                        <table class='profile-table'>
                                            <tr class='profile-table-header'>
                                                <th class='profile-table-element'>Name</th>
                                                <th class='profile-table-element'>Points</th>
                                            </tr>
                                            {bonuses}
                                        </table>
                                    </div>
                                }
                                <h3 class='profile-header'>Total Points</h3>
                                <table class='profile-table'>
                                    <tr class='profile-table-header'>
                                        <th class='profile-table-element'>Base Points</th>
                                        <th class='profile-table-element'>Bonus Points</th>
                                        <th class='profile-table-element'>Total Points</th>
                                    </tr>
                                    <tr class='profile-table-odd'>
                                        <td class='profile-table-element'>{json.base_points}</td>
                                        <td class='profile-table-element'>{json.points - json.base_points}</td>
                                        <td class='profile-table-element'>{json.points}</td>
                                    </tr>
                                </table>                       
                            </div>
                        </div>
                    );
                } catch(error) {
                    navigate('/');
                }
            });
    }, [navigate, params.player, image]);

    if(user.username === null)
    {
        navigate('/');
    }
    else
    {
        return (
            <div id='profile-content'>
                {content}
            </div>
        );
    }
}

export default Profile;