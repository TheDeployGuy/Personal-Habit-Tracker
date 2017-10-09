import React, { Component } from 'react';

class AddHabit extends Component {
    
    addHabit(e){
        // Add habit to db..then redirect
        const new_habit = {
            'name': this.refs.habit_name.value,
            'description': '',
            'target': parseInt(this.refs.habit_target.value, 10),
            'completed': 0,
            'target_month': 'October'
        }

        fetch('http://localhost:3001/api/occurrence_habits', {
            method: 'POST',
            headers:{
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(new_habit)
          })
          .then(response => response.json())
          .then(result => console.log(result));

        e.preventDefault()
    }
    
    render() {
        return (
            <div>
                <h1 className="m-3">Add Habit</h1>
                <form onSubmit={this.addHabit.bind(this)}>
                    <div className="form-group">
                        <label htmlFor="habit_name">Habit Name:</label>
                        <input type="text" className="form-control" ref="habit_name" id="habitName" placeholder="Habit Name e.g. Wake up before 8am each day" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="habit_desc">Habit Description:</label>
                        <input type="text" className="form-control" ref="habit_desc" id="habit_desc" placeholder="Why do you want to complete it?" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="habit_target">How many days do you want to do this habit?</label>
                        <input type="number" className="form-control" ref="habit_target" name="days" step="1" min="1" max="30" placeholder="1" />
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
            </div>
        )
    }

}

export default AddHabit;