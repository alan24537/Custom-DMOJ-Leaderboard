# Custom-DMOJ-Leaderboard

## Inspiration

Students at our's school's computer science club have been interested in contest programming for over a decade; we've had students in the past represent Canada at CCO and IOI! However, in recent times, the computer science club has seen a decrease in homework problem solves, so we created this web app to incentivize people do the homework.

## What it does

Custom DMOJ Leaderboard keeps track of a list of people and the DMOJ competitive programming problems they've solved. This way, it is possible to show their rank among other people based on the problems assigned for homework. It is customizable in that users and problems can be added and deleted to/from the leaderboard.

## How we built it

We built Custom DMOJ Leaderboard using React, Express, Firebase, and CSS. The Firebase database stores information about the users and problems that are in a certain table. The backend in Express was used to get information from DMOJ using their API as well as stored information from the Firebase. The front end was done using CSS.

## Challenges we ran into

The biggest challenge we ran into was the rate limit on DMOJ's API. The rate limit forced us to think of new ways to optimize the API calls we were sending. In the end, we decided on storing more data in Firebase and setting a delay to the interval when we are calling DMOJ's API.

## Accomplishments that we're proud of

We are proud of completing this project in time. Hopefully, it will be used at computer science club next year!

## What we learned

We learned how to style things with CSS and connect front end to back end to database.

## What's next for Custom DMOJ Leaderboard

In the future, we might expand to other competitive programming sites such as Codeforces.
