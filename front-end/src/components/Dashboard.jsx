import React, { Component } from 'react';
import moment from 'moment';
import { Link } from 'react-router-dom';
import Habit from './Habit';
import HabitGroup from './HabitGroup';
import DashboardControls from './DashboardControls';

class Dashboard extends Component {
  /*
    When components mounts, fetch user habits from backend
    For each habit the user has defined create a Habit element.
  */
  state = {
    habits: [],
    displayedHabits: [],
    currentMonth: moment().format('MMMM'),
    currMonDaysLeft: moment().endOf('month').diff(moment().today, 'days'),
    daysLeft: moment().endOf('month').diff(moment().today, 'days'),
    displayMonthIndex: 0, // This will be used to track what month is displaying compared to the current month
    displayedYear: moment().format('YYYY'),
  }

  // todo: DRY up duplicated in ChallengeDashboard
  componentDidMount() {
    this.getHabits();
  }

  getHabits = async () => {
    const habits = await (await fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits`)).json();
    this.setState({ habits });
    this.filterHabits(this.state.currentMonth, this.state.displayedYear);
  }

  filterHabits = (month, year) => {
    const filteredHabits = this.state.habits
                            .filter(habit => habit.year === year)
                            .filter(habit => habit.target_month === month);
    this.setState({ displayedHabits: filteredHabits });
  }

  // todo: DRY up duplicated in ChallengeDashboard
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

  // todo: DRY up duplicated in ChallengeDashboard
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
    // .catch(e => console.log(`Failed to Update habit ${e}`));
  }

    // todo: DRY up duplicated in ChallengeDashboard
  handleHabitDelete = async (id) => {
    await (await fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits/${id}`, { method: 'DELETE' })).json();
    this.getHabits();
      // .catch(e => console.log(`Failed to Delete habit ${e}`));
  }

  displayMonthsHabits = (e) => {
    // This is kinda confusing, when we want to go back we subtract that number from the current month, if it is minus we still subtract but we update the index -1
    const dataOperationNum = parseInt(e.target.getAttribute('data-operation'), 10);
    const newIndex = dataOperationNum !== 0 ? this.state.displayMonthIndex + dataOperationNum : 0;
    const displayedMonth = moment().subtract(newIndex, 'month').format('MMMM');
    const newDisplayedYear = moment().subtract(newIndex, 'month').format('YYYY');
    this.filterHabits(displayedMonth, newDisplayedYear);
    this.setState({
      currentMonth: displayedMonth,
      displayMonthIndex: newIndex,
      displayedYear: newDisplayedYear,
      daysLeft: moment().subtract(newIndex, 'month').endOf('month').diff(moment().today, 'days'),
    });
    e.preventDefault();
  }

  render() {
    // 1. Get all unique categories
    const categories = new Set(this.state.displayedHabits.map(habit => habit.category));
    const categoriesElements = {};
    // 2. For each category, create a new category in categoriesElements which will contain a list of Habits that are of that category
    [...categories].forEach((category) => {
      categoriesElements[category] =
            this.state.displayedHabits.filter(habit => habit.category === category) // Filter to only habits that match the category
                            .map(habit => <Habit key={habit.id} habit={habit} monthDaysLeft={this.state.daysLeft} onHabitItemUpdated={this.handleHabitItemUpdate} onDelete={this.handleHabitDelete} />); // For each habit in that category create a habit element
    });

    // 3. Loop through each category and add some extra html, this will be its own component later (HabitGroup)
    const finalElements = Object.keys(categoriesElements).map(category =>
      <HabitGroup key={category} category={category} categoriesHabits={categoriesElements[category]} />);

    return (
      <div id="dashboard">
        <div className="row mt-3">
          <div className="ml-auto col-md-6 text-center">
            <DashboardControls onMonthChange={this.displayMonthsHabits} displayedMonth={this.state.currentMonth} displayedYear={this.state.displayedYear} />
          </div>
          <div className="col-lg-2 col-md-4 col-sm-12 text-center">
            <h4 className="header-title">
              <a href="" onClick={this.displayMonthsHabits} data-operation="0"> {moment().format('MMMM')}</a>
              <span className="ml-2">{this.state.currMonDaysLeft} Days Left!</span>
            </h4>
          </div>
          <div className="col-md-2">
            <Link to="/addhabit" type="button" className="btn btn-success pull-right">Add Habit</Link>
          </div>
        </div>
        <div id="habit-list" className="mt-3 row">
          {finalElements}
        </div>
      </div>
    );
  }
}

export default Dashboard;