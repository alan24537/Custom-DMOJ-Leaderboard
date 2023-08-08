const express = require('express');
const axios = require('axios');
const app = express();
const port = 5000; // Change this to the desired port number
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const {db} = require("./firebase.js");
const admin = require('firebase-admin');

const cors = require('cors');
app.use(cors());

app.get('/alltables', async (req, res) => {
  const allTables = await db.listCollections();
  const allTableNames = [];
  allTables.forEach(table => {
    if (table.id !== "total") {
        allTableNames.push(table.id);
    }
  });
  res.send({ collections: allTableNames});
});

async function getDmojData() {
    console.log("Getting DMOJ data");
    const userRef = db.collection('total').doc('users');
    const userDoc = await userRef.get();
    const userData = userDoc.data();

    for (const field in userData) {
        const username = field;
        // console.log(username);
        const url = `https://dmoj.ca/api/v2/submissions?user=${username}`;
        try {
            const response = await axios.get(url);
            const data = response.data;
            const submissions = data["data"]["objects"];
            for (const submission of submissions) {
                const problem = submission["problem"];
                const points = submission["points"];
                if (!(problem in userData[username])) {
                    continue;
                }
                if (points > userData[username][problem]) {
                    userData[username][problem] = points;
                }
            }
            const total_pages = data["data"]["total_pages"];
            for (let page = 2; page <= total_pages; page ++) {
                const response = await axios.get(url + `&page=${page}`);
                const data = response.data;
                const submissions = data["data"]["objects"];
                for (const submission of submissions) {
                    const problem = submission["problem"];
                    const points = submission["points"];
                    if (!(problem in userData[username])) {
                        continue;
                    }
                    if (points > userData[username][problem]) {
                        userData[username][problem] = points;
                    }
                }
            }
        }
        catch (error) {
            console.log("Error in fetching the data:", error.message);
        }
    }
    await userRef.set(userData);
    console.log("Got and wrote DMOJ data to firestore");
}
getDmojData();
const interval = setInterval(getDmojData, 90000); // runs getDmojData() every 90 seconds

app.post('/gettable', async (req, res) => {
    const data = req.body;
    const tableId = data["id"];

    const totalUserDoc = await db.collection("total").doc("users").get();
    const userDoc = await db.collection(tableId).doc("users").get();
    const problemDoc = await db.collection(tableId).doc("problems").get();

    const users = userDoc.data()["user_ids"];
    const problems = problemDoc.data()["problem_ids"];
    const problemPoints = problemDoc.data()["problem_pts"];
    const totalUserPoints = totalUserDoc.data();

    console.log(totalUserPoints);

    const table = {
        "header_row": ["Rank", "Username", ...problems, "Total"],
        "rows": []
    }

    for (let i = 0; i < users.length; i ++) {
        const row = [i + 1, users[i]];
        let total = 0;
        for (let j = 0; j < problems.length; j ++) {
            const points = (totalUserPoints[users[i]][problems[j]] / problemPoints[j]) * 100;
            console.log(users[i], problems[j], totalUserPoints[users[i]][problems[j]], problemPoints[j], points);
            row.push(points.toFixed(2));
            total += points;
        }
        row.push(total.toFixed(2));
        table["rows"].push(row);
    }

    function sortTableRows(a, b) {return b[b.length - 1] - a[a.length - 1];}
    table["rows"].sort(sortTableRows);

    for (let i = 0; i < table["rows"].length; i ++) {
		table["rows"][i][0] = i + 1;
	}

    res.send(table);
});

//Make new table
/*
body = {
    "id": id_of_the_new_collection,
    "password": pw_of_the_new_collection
}
*/
app.post('/addtable', async (req, res) => {
    const data = req.body;

    const id = data["id"];
    const pw = data["password"];

    const userDoc = {
        "user_ids": []
    };

    const problemDoc = {
        "problem_ids" : [],
        "problem_pts": []
    }

    const passDoc = {
        "password": pw
    }

    db.collection(id)
        .doc("users")
        .set(userDoc)
    db.collection(id)
        .doc("problems")
        .set(problemDoc)
    db.collection(id)
        .doc("password")
        .set(passDoc)

    res.send("Table created")
});

//Make Log into admin page
/*
body = {
    "table_id": tableId
    "password": attempted_password
}
*/
app.post('/auth', async (req, res) => {
    const data = req.body;

    const table_id = data["table_id"]
    const pw = data["password"];

    const good = {"response":"GOOD"};
    const bad = {"response":"BAD"};

    const docRef = db.collection(table_id).doc('password');

    const fieldName = "password";
    
    docRef
        .get()
        .then((doc) => {
        if (!doc.exists) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Extract the value of the specified field
        const fieldValue = doc.data()[fieldName];
        if (fieldValue === undefined) {
            return res.status(404).json({ error: `Field "${fieldName}" not found in the document` });
        }

        if (fieldValue === pw){
            res.status(200).send(good);
        }

        else{
            res.status(404).send(bad);
        }
        })
        .catch((error) => {
            console.error('Error getting document: ', error);
            res.status(500).json({ error: 'Failed to get the field value' });
        });  

});

//Add user to leaderboard
/*
body = {
    "username": username_to_add,
    "table_id": leaderboard_id
}
*/
app.post('/addUser', async (req, res) => {
    const data = req.body;

    const username = data["username"];
    const table_id = data["table_id"];

    
    const url = "https://dmoj.ca/api/v2/user/" + username;


    try {
        // Make the GET request using axios
        const response = axios.get(url)
            .then(response => {
            // Handle the response data here
            console.log(response.data);
            })
            .catch(error => {
            // Handle errors here
            console.error('Error fetching data:', error);
            });
    
        // Extract the data from the response
        const data = response.data;

        const userDocRef = db.collection(table_id).doc('users');
        
        await userDocRef.update({
            ["user_ids"]: admin.firestore.FieldValue.arrayUnion(username)
          });

        const problem_ids_doc = await db.collection(table_id).doc('problems').get();
        const problem_ids = problem_ids_doc.data()["problem_ids"];

        const userRef = db.collection('total').doc('users');
        const usersDoc = await userRef.get();
        const usersData = usersDoc.data()

        if (!usersData.hasOwnProperty(username)) {
            usersData[username] = {};
        }
        const userProblems = usersData[username];
        problem_ids.forEach(problem_id => {
            if (!userProblems.hasOwnProperty(problem_id)) {
                userProblems[problem_id] = 0;
            }
        });
        await userRef.set(usersData);

        res.send("Yay");
        
    } 
    catch (error) {
        // Handle any errors that occur during the request
        console.error('Error while fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

//Add problem to leaderboard
/*
body = {
    "problem": problem_to_add,
    "table_id": leaderboard_id
}
*/
app.post('/addProblem', async (req, res) => {
    const data = req.body;

    const problem = data["problem"];
    const table_id = data["table_id"];

    const url = "https://dmoj.ca/api/v2/problem/" + problem;

    try {
        // Make the GET request using axios
        const response = await axios.get(url);
    
        // Extract the data from the response
        const data = response.data;

        const problemDocRef = db.collection(table_id).doc('problems');
        await problemDocRef.update({
            ["problem_ids"]: admin.firestore.FieldValue.arrayUnion(problem)
        });
        console.log("NEW POINTS: ", data['data']['object']['points']);

        // Get the data from the document
        problemDocRef.get().then(async (doc) => {
            if (doc.exists) {
                // Access the field value
                const fieldValue = doc.data()['problem_pts']; 
                fieldValue.push(data['data']['object']['points']);
                console.log("Field Value:", fieldValue);
                await problemDocRef.update({
                    ["problem_pts"]: fieldValue
                });
            } else {
            console.log("No such document!");
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });

        

        const user_ids_doc = await db.collection(table_id).doc('users').get();
        const user_ids = user_ids_doc.data()["user_ids"];

        const userRef = db.collection('total').doc('users');
        const usersDoc = await userRef.get();
        const usersData = usersDoc.data()

        user_ids.forEach(user_id => {
            if (!usersData.hasOwnProperty(user_id)) {
                usersData[user_id] = {};
            }
            const userProblems = usersData[user_id];
            if (!userProblems.hasOwnProperty(problem)) {
                userProblems[problem] = 0;
            }
        });
        await userRef.set(usersData);
        
        res.send("Yay")
    } 
    catch (error) {
        // Handle any errors that occur during the request
        console.error('Error while fetching data:', error.message);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

//Delete user from leaderboard
/*
body = {
    "username": username_to_delete,
    "table_id": leaderboard_id
}
*/
app.post('/deleteUser', async (req, res) => {
    const data = req.body;

    const username = data["username"];
    const table_id = data["table_id"];

    const userDocRef = db.collection(table_id).doc('users');

    const fieldName = 'user_ids';

    userDocRef
        .update({
            [fieldName]: admin.firestore.FieldValue.arrayRemove(username),
        })
        .then(() => {
            console.log('Document updated successfully');
            res.json({ message: 'Element removed from the array successfully' });
        })
        .catch((error) => {
            console.error('Error updating document: ', error);
            res.status(500).json({ error: 'Failed to remove the element from the array' });
        });  

    // Breaks if there is a problem that is in more than one table
    // const problemIdDoc = await db.collection(table_id).doc('problems').get();
    // const problem_ids = problemIdDoc.data()["problem_ids"];

    // const totalUserRef = db.collection('total').doc('users');
    // const totalUserDoc = await totalUserRef.get();
    // const totalUserData = totalUserDoc.data();

    // problem_ids.forEach(problem_id => {
    //     delete totalUserData[username][problem_id];
    // });
    // await totalUserRef.set(totalUserData);

});

//Add problem to leaderboard
/*
body = {
    "problem": problem_to_add,
    "table_id": leaderboard_id
}
*/
app.post('/deleteProblem', async (req, res) => {
    const data = req.body;

    const problem = data["problem"];
    const table_id = data["table_id"];

    const docRef = db.collection(table_id).doc('problems');

    docRef.get()
        .then((doc) => {
            if (doc.exists) {
                const problems = doc.data()['problem_ids']; 
                var ind = 0;
                for (var i = 0; i<problems.length; i++){
                    if (problems[i] === problem){
                        ind = i;
                        break;
                    }
                }
                console.log('INDEX', ind);

                const points = doc.data()['problem_pts'];
                points.splice(ind, 1);

                docRef.update({
                    ['problem_ids']: admin.firestore.FieldValue.arrayRemove(problem),
                })
                docRef.update({ 'problem_pts': points })
                
            } else {
                console.log("Document not found");
            }
        })
        .catch((error) => {
            console.log("Error getting document:", error);
        }); 

    

    //Breaks if there is a problem that is in more than one table
    // TODO: Delete the field when the map is empty
    // const userDoc = await db.collection(table_id).doc('users').get();
    // const user_ids = userDoc.data()["user_ids"];

    // const totalUserRef = db.collection('total').doc('users');
    // const totalUserDoc = await totalUserRef.get();
    // const totalUserData = totalUserDoc.data();

    // user_ids.forEach(user_id => {
    //     delete totalUserData[user_id][problem];
    // });
    // await totalUserRef.set(totalUserData);
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
