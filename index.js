const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

app.use(cors());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

let users = [];
let exercises = [];
let logs = [];

//users

const getUser = (_id) => {
  return users.find((user) => user._id == _id);
};

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;

  if (!username) return res.json({ error: "invalid username" });

  const user = {
    username,
    _id: Math.floor(Math.random() * 10000000000).toString(),
  };
  users.push(user);
  res.json(user);
});


//exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const { _id } = req.params;
  let { description, duration, date } = req.body;
  duration = Number(duration);
  //check description and duration
  if (!description || !duration) {
    return res.json({ error: "Failed data" });
  }

  //give current date if date is not given
  if (date){
    date = new Date(date).toDateString();
  }else{
    date = new Date().toDateString();
  }

  //check user exists
  const user = getUser(_id);
  if (!user) {
    return res.json({ error: "Some field is wrong" });
  }
  const exercise = {
    _id: user._id,
    username: user.username,
    date,
    duration,
    description,
  };
  console.log("new exercise", exercise);
  exercises.push(exercise);
  res.json(exercise);
});

//logs
app.get("/api/users/:_id/logs", (req, res) => {
  const { _id } = req.params;
  const initialDate = req.query.from;
  const finalDate = req.query.to;
  const limit = req.query.limit;

  let logs_user = [];

  const user = getUser(_id);

  if (!user) return res.json({ error: "Some field is wrong" });

  exercises.find((exercise) => {
    if (exercise._id == _id) {
      const data = {
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      };
      // if limit is exceded
      if (limit == logs_user.length) return;

      //if dates query params are added to request
      if (initialDate && finalDate) {
        //date format
        try {
          const fromDate = new Date(initialDate);
          const toDate = new Date(finalDate);
          const date = new Date(exercise.date);
          if (date >= fromDate && date < toDate) {
            logs_user.push(data);
          }
        } catch (e) {
          res.json({ error: "Incorrect date format" });
        }
      } else {
        logs_user.push(data);
      }
    }
  });

  const log = {
    username: user.username,
    count: logs_user.length,
    _id: user._id,
    log: logs_user,
  };

  res.json(log);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
