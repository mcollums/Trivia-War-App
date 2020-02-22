const axios = require('axios');
const mongoose = require("mongoose");
const db = require("../models");
const htmlToText = require("html-to-text");

// const text = htmlToText.fromString(originText);


mongoose.connect(
    process.env.MONGODB_URI ||
    "mongodb://localhost/trivia_masters"
);

makeArr = (data, callback) => {
    let string = htmlToText.fromString(data);
    let answersObject = string.split(',');

    console.log("DATA FROM MAKEARR "+ answersObject);
    console.log("IS ARRAY? " + Array.isArray(answersObject));
    return {answersObject};
    // callback(newArr);
}
imageArr = [
    "https://biox.stanford.edu/sites/g/files/sbiybj7941/f/creativity_banner.png",
    "https://blog.oup.com/wp-content/uploads/2016/02/1260-music.jpg",
    "https://images-na.ssl-images-amazon.com/images/I/A1ewqwDYPdL._SL1500_.jpg",
    "https://blogs.glowscotland.org.uk/my/forresacademy/files/2017/03/Cover-Photo-672x372.png",
    "https://i.pinimg.com/originals/f7/28/11/f72811b3ba11adb67aede56f44afd6fe.jpg",
    "http://mathcreativity.com/wp-content/uploads/2014/08/math-art-one-005.jpg",    
    "https://otrfilmfest.org/wp-content/uploads/2018/06/camera-otr-film-fest-icon-600w.png",
    "https://www.cartoonbrew.com/wp-content/uploads/tooartfortv09.jpg",
    "https://ih0.redbubble.net/image.389209705.4734/flat,550x550,075,f.u1.jpg",
    "https://i.ebayimg.com/00/s/ODAwWDgwMA==/z/yHQAAOSwGPxaJ2sM/$_57.JPG?set_id=8800005007",
    "https://render.fineartamerica.com/images/rendered/default/print/8.000/6.375/break/images/artworkimages/medium/1/unicorn-rainbow-watercolor-olga-shvartsur.jpg",
    "https://cdn131.picsart.com/241232673025202.png?r1024x1024",
];

categoriesArray = [9, 12, 15, 21, 26, 19, 11, 14, 22, 27, 20, 31];
triviaSeed = [];
runSeeds = (i) => {
    console.log("we running stuff");

    // We then run the request with axios module on a URL with a JSON
    axios.get("https://opentdb.com/api.php?amount=10&category=" + categoriesArray[i] + "&type=multiple").then(
        function (response) {
            // Then we print out the trivia api data
            console.log("we got stuff")
            // console.log("Response from Trivia API: " + JSON.stringify(response.data.results));
            let results = response.data.results;
            // console.log(results[0].category);

            triviaSeed.push(
                {
                    image: imageArr[i],
                    category: results[0].category,
                    questions: [
                        {
                            "question": htmlToText.fromString(results[0].question),
                            "answers": makeArr(results[0].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[0].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[1].question),
                            "answers": makeArr(results[1].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[1].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[2].question),
                            "answers": makeArr(results[2].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[2].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[3].question),
                            "answers": makeArr(results[3].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[3].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[4].question),
                            "answers": makeArr(results[4].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[4].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[5].question),
                            "answers": makeArr(results[5].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[5].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[6].question),
                            "answers": makeArr(results[6].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[6].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[7].question),
                            "answers": makeArr(results[7].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[7].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[8].question),
                            "answers": makeArr(results[8].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[8].correct_answer)
                        },
                        {
                            "question": htmlToText.fromString(results[9].question),
                            "answers": makeArr(results[9].incorrect_answers),
                            "correctAnswer": htmlToText.fromString(results[9].correct_answer)
                        }
                    ]
                }
            );

            i++;
            if (i === categoriesArray.length) {
                console.log("we're done")
                db.Game
                    .collection.insertMany(triviaSeed)
                    .then(data => {
                        console.log(data.result.n + " records inserted!");
                        process.exit(0);
                    })
                    .catch(err => {
                        console.error(err);
                        process.exit(1);
                    });
            }
            else {
                console.log("running this again")
                runSeeds(i);
            }
        }

    );
}

runSeeds(0);