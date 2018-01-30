import React, { Component } from 'react';
import ChallengeHabit from './ChallengeHabit';
import moment from 'moment';

// This class has a lot of duplciate logic from Dashboard.js, I will continue to get it working then refactor/generalize as do not want to do that to early.
class ChallengeDashboard extends Component {

  state = {
    filter_obj: '{"where": {"target_month": "challenge"}}',
    habits: [
      {
        name: 'Gym',
        id: '12345',
        target: 30,
        completed: 0,
        last_update: 'Never',

      },
    ],
  }

  componentDidMount() {
    this.getHabits();
  }

  getHabits = async () => {
    const results = await (await fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits?filter=${this.state.filter_obj}`)).json();
    this.setState({ habits: results });
    // .catch(e => console.log(`Failed to get all habits ${e}`));
  }

  handleHabitItemUpdate = (id, numCompleted) => {
    const existingHabits = this.state.habits;
     // 1. Find the habit we are updating
    const habitIndex = this.state.habits.findIndex(habit => habit.id === id);
     // 2. change the value of num of completed
    existingHabits[habitIndex].completed = numCompleted;
     // 3. Set the last_updated date to today.
    existingHabits[habitIndex].last_updated = moment().format('Do@HH:mm');
     // 4. Update the state with new habit object but keeping older ones??
    this.setState({ habits: existingHabits });
     // 5. Update the habit in the backend
    this.updateHabit(existingHabits[habitIndex], id);
  }

  updateHabit = async (habitDetails, id) => {
    const requestDetails = {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitDetails),
    };
    await (await fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits/${id}`, requestDetails)).json();
    console.log(`Habit: ${id} updated...`);
  }

  render() {
    const challengeHabits = this.state.habits.map(habit =>
      <ChallengeHabit key={habit.name} habit={habit} onHabitItemUpdated={this.handleHabitItemUpdate} />,
    );
    return (
      <div id="challenge-dashboard">
        <div className="header text-center">
          <h1 className="mt-3">Challenge Dashboard</h1>
          <h3>Challenge yourself by Taking X Day Challenges!</h3>
        </div>
        <div className="mt-3 row">
          {challengeHabits}
        </div>
      </div>
    );
  }
}

export default ChallengeDashboard;
