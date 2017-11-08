import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Habit from './Habit';
import moment from 'moment';

class Dashboard extends Component {
  /*
    When components mounts, fetch user habits from backend
    For each habit the user has defined create a Habit element.
  */
  state = {
    habits: [],
    current_month: moment().format('MMMM'),
    filterObj: `{"where": {"target_month": "${moment().format('MMMM')}", "year": "${moment().format('YYYY')}"}}`,
    currMonDaysLeft: moment().endOf('month').diff(moment().today, 'days'),
    daysLeft: moment().endOf('month').diff(moment().today, 'days'),
    displayMonthIndex: 0, // This will be used to track what month is displaying compared to the current month
    displayedYear: moment().format('YYYY'),
  }

  componentDidMount() {
    this.getFilteredHabits(this.state.filterObj);
  }

  getFilteredHabits = (filterObj) => {
    fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits?filter=${filterObj}`)
      .then(response => response.json())
      .then(results => this.setState({ habits: results }))
      .catch(e => console.log(`Failed to get filitered habits ${e}`));
  }

  handleHabitItemUpdate = (id, numCompleted) => {
    const existingHabits = this.state.habits;
    // 1. Find the habit we are updating
    const habitIndex = this.state.habits.findIndex(habit => habit.id === id);
    // 2. change the value of num of completed
    existingHabits[habitIndex].completed = numCompleted;
    // 3. Set the last_updated date to today.
    existingHabits[habitIndex].last_updated = moment().format('Do');
    // 4. Update the state with new habit object but keeping older ones??
    this.setState({ habits: existingHabits });
    // 5. Update the habit in the backend
    this.updateHabit(existingHabits[habitIndex], id);
  }

  updateHabit = (habitDetails, id) => {
    fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(habitDetails),
    })
    .then(response => response.json())
    .then(result => console.log(`Habit: ${id} updated...`))
    .catch(e => console.log(`Failed to Update habit ${e}`));
  }

  handleHabitDelete = (id) => {
    fetch(`${process.env.REACT_APP_API_ENPOINT}/api/occurrence_habits/${id}`, { method: 'DELETE' })
      .then(response => response.json())
      .then(result => this.getFilteredHabits(this.state.filterObj))
      .catch(e => console.log(`Failed to Delete habit ${e}`));
  }

  displayMonthsHabits = (e) => {
    // This is kinda confusing, when we want to go back we subtract that number from the current month, if it is minus we still subtract but we update the index -1
    const dataOperationNum = parseInt(e.target.getAttribute('data-operation'), 10);
    const newIndex = dataOperationNum !== 0 ? this.state.displayMonthIndex + dataOperationNum : 0;
    const displayedMonth = moment().subtract(newIndex, 'month').format('MMMM');
    const newDisplayedYear = moment().subtract(newIndex, 'month').format('YYYY');
    const filterObj = this.state.filterObj.replace(this.state.current_month, displayedMonth).replace(this.state.displayedYear, newDisplayedYear);

    this.getFilteredHabits(filterObj);
    this.setState({
      current_month: displayedMonth,
      filterObj,
      displayMonthIndex: newIndex,
      displayedYear: newDisplayedYear,
      daysLeft: moment().subtract(newIndex, 'month').endOf('month').diff(moment().today, 'days'),
    });
    e.preventDefault();
  }

  render() {
    // todo: Needs to be a way better way to do this...
    //1. Get all the categories
    const categories = this.state.habits.map(habit => habit.category);
    const items = {};
    // 2. For each unique category, create a new category in items which will contain a list of Habits that are of that category
    [...new Set(categories)].forEach((cat) => {
      items[cat] =
            this.state.habits.filter(habit => habit.category === cat) // Filter to only habits that match the category
                             .map(habit => <Habit key={habit.id} habit={habit} monthDaysLeft={this.state.daysLeft} onHabitItemUpdated={this.handleHabitItemUpdate} onDelete={this.handleHabitDelete} />); // For each habit in that category create a habit element
    });

    // 3. Loop through each category and add some extra html, this will be its own component later (HabitGroup)
    const finalElements = Object.keys(items).map(item => (
        // This should be its own component...
      <div key={item} id={item} className="card-box col-10 mx-auto">
        <h4 className="header-title mb-4"><b>{item}</b></h4>
        {items[item]}
      </div>
      ));

    return (
      <div id="dashboard">
        <div className="row mt-3">
          <div className="ml-auto col-md-6 text-center">
            <h4 className="header-title-big">
              <i onClick={this.displayMonthsHabits} data-operation="+1" className="mr-3 fa fa-chevron-left btn-link" aria-hidden="true" role="button" />
              {this.state.current_month} - {this.state.displayedYear}
              <i onClick={this.displayMonthsHabits} data-operation="-1" className="ml-3 fa fa-chevron-right btn-link" aria-hidden="true" role="button" />
            </h4>
          </div>
          <div className="col-2">
            <h4 className="header-title">
              <a href="" onClick={this.displayMonthsHabits} data-operation="0"> {moment().format('MMMM')}</a>
              <span className="ml-2">{this.state.currMonDaysLeft} Days Left!</span>
            </h4>
          </div>
          <div className="col-md-1">
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
