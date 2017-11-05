import React, { Component } from 'react';
import moment from 'moment';
import HabitSuggestion from './HabitSuggestion';

class AddHabit extends Component {

    state = {
        name: '',
        description: '',
        category: '',
        target: 0,
        existing_habits: [],
        filter_obj: `{"where": {"target_month": "${moment().format('MMMM')}"}}`,
        year: `${moment().format('YYYY')}`,
        msg: ''
    }
    
    componentDidMount(){
        this.getHabits();
    }

    getHabits = () => {
        // This will get habits from this month so you can add it to next month, improvement would be get habits from last X months
        fetch(`http://localhost:3001/api/occurrence_habits?filter=${this.state.filter_obj}`)
          .then(response => response.json())
          .then(results => this.setState({existing_habits: results}))
          .catch(e => console.log(`Failed to get all habits ${e}`));
    }

    handleSelectedHabit = (e) => {
        this.setState({
            name:  e.target.getAttribute('data-name'),
            description: e.target.getAttribute('data-description'),
            category: e.target.getAttribute('data-category'),
            target: e.target.getAttribute('data-target')
        })
        e.preventDefault()
    }

    onSubmit = (e) => {
        // Add habit to db..then redirect
        const new_habit = {
            'name': this.refs.habit_name.value,
            'description': this.refs.habit_desc.value,
            'category': this.refs.habit_cat.value,
            'target': parseInt(this.refs.habit_target.value, 10),
            'completed': 0,
            'target_month': this.refs.habit_mon.value,
            'year': this.state.year
        }

        // {"where": {"target_month": "${moment().format('MMMM')}"}}
        const filter_settings = `{"name": "${new_habit.name}", "target_month": "${new_habit.target_month}"}`

        fetch(`http://localhost:3001/api/occurrence_habits/count?where=${filter_settings}`)
            .then(response => response.json())
            .then(results => {
                if (results.count === 0){
                    this.addHabit(new_habit)
                }else{
                    this.setState({msg: `Habit ${new_habit.name} already exists for month ${new_habit.target_month}`})
                }
            });

        e.preventDefault()
    }
    
    addHabit = (habit) => {
        fetch('http://localhost:3001/api/occurrence_habits', {
            method: 'POST',
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(habit)
          })
          .then(response => response.json())
          .then(result => this.props.history.push('/'))
          .catch(e => console.log(`Failed to add new habit ${e}`));
    }

    handleInputChange = (e) => {
        const {name, value} = e.target
        this.setState({
            [name]: value
        })
    }

    render() {
        const current_mon_index = parseInt(moment().format('M'), 10) - 1 // Seems to be 0 indexed
        const habitsElements = this.state.existing_habits.map(habit => <HabitSuggestion key={habit.id} habit={habit} onSelect={this.handleSelectedHabit} />)
        const msg_displaying = this.state.msg.length > 0 ? <div className="alert alert-info text-center">{this.state.msg}</div> : ''
        return (
            <div>
                <h1 className="m-3 text-center">Add Habit</h1>
                {msg_displaying}
                <div className="row">
                    <div className="ml-auto col-6">
                        <form onSubmit={this.onSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Habit Name:</label>
                                <input type="text" className="form-control" ref="habit_name" name="name" placeholder="Habit Name e.g. Wake up before 8am each day" value={this.state.name} onChange={this.handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description:</label>
                                <input type="text" className="form-control" ref="habit_desc" name="description" placeholder="Why do you want to complete it?"  value={this.state.description} onChange={this.handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="category">Category:</label>
                                <input type="text" className="form-control" ref="habit_cat" name="category" placeholder="Health / Finance / Career" value={this.state.category} onChange={this.handleInputChange} required />
                            </div>
                            <div className="form-group">
                            <label htmlFor="habit_mon">Month of Habit:</label>
                            <select className="form-control" id="habit_mon" ref="habit_mon" required>
                                <option disabled>Choose Month</option>
                                <option>{moment.months(current_mon_index)}</option>
                                <option selected>{moment.months(current_mon_index + 1)}</option>
                            </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="target">How many days do you want to do this habit?</label>
                                <input type="number" className="form-control" ref="habit_target" name="target" step="1" min="1" max="30" placeholder="1"  value={this.state.target} onChange={this.handleInputChange} />
                            </div>
                            <button type="submit" className="btn btn-primary">Submit</button>
                        </form>
                    </div>
                    <div className="col-3">
                        {habitsElements}
                    </div>
                </div>
            </div>
        )
    }

}

export default AddHabit;