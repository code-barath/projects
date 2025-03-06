var express = require("express");
var db = require('./db-connections');
var app = express();
app.use(express.json());

app.use(express.static("./public"));


// Get all tasks
app.route("/tasks").get(function(req, res) {
    const query = `
        SELECT t.id, t.task_name, t.deadline
        FROM tasks t;
    `;
    db.query(query, function(err, results) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});


// Add a new task
app.route("/tasks").post(function(req, res) {
    const { task_name, deadline } = req.body;
    if (!task_name || !deadline) {
        return res.status(400).json({ error: 'Task name and deadline are required' });
    }

    const query = `
        INSERT INTO tasks (task_name, deadline)
        VALUES (?, ?)
    `;

    db.query(query, [task_name, deadline], function(err, results) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: 'Task created successfully',
            taskId: results.insertId,
            task_name: task_name,
            deadline: deadline
        });
    });
});

// Delete Task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ message: 'Task not found' });
      } else {
        res.status(200).json({ message: 'Task deleted' });
      }
    });
  });

// Extend task deadline
app.route("/tasks/:id/extend").post(function(req, res) {
    const taskId = req.params.id;
    const { new_deadline } = req.body;

    if (!new_deadline) {
        return res.status(400).json({ error: 'New deadline is required' });
    }

    const query = `
        UPDATE tasks
        SET deadline = ?
        WHERE id = ?
    `;

    db.query(query, [new_deadline, taskId], function(err, results) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json({
            message: 'Task deadline updated successfully',
            new_deadline: new_deadline
        });
    });
});



app.listen(8080, "127.0.0.1");
console.log("web server running @ http://127.0.0.1:8080");