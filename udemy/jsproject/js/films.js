"use strict";
let numberOfFilms;

function start() {
    numberOfFilms = prompt("Сколько фильмов вы уже просмотрели?", "");

    while (numberOfFilms == '' || numberOfFilms == null || isNaN(numberOfFilms)) {
        numberOfFilms = prompt("Сколько фильмов вы уже просмотрели?", "");
    }

}

start();

const personalMovieDB = {
    count: numberOfFilms,
    movies: {},
    actors: {},
    genres: [],
    privat: false
};

function rememberMyFilms() {

    for (let i = 1; i <= 2; i++) {
        const   a = prompt("Один из последних просмотренных фильмов?", ""),
        b = prompt("На сколько оцените его?", "");
        if (a != null && b != null && a != '' && b != '' && a.length < 50) {
            personalMovieDB.movies[a] = b;
        } else {
            i--;
        }
    }
    console.log(personalMovieDB);
}

function detectPersonalLevel() {
    console.log("из другой функции", personalMovieDB);    
    if (personalMovieDB.count <= 10) {
        console.log('Просмотрено довольно мало фильмов', personalMovieDB.count);
    } else if (personalMovieDB.count > 10 && personalMovieDB.count <= 30) {
        console.log("Вы классический зритель", personalMovieDB.count);
    } else if (personalMovieDB.count > 30) {
        console.log("Вы киноман", personalMovieDB.count);
    } else {
        console.log("Произошла ошибка", personalMovieDB.count);
    }
    
}


function showMyDB() {
    if (personalMovieDB.privat == false) {
        console.log(personalMovieDB);
    }
}

function writeYourGenres() {
    for (let i = 0; i<=2; i++) {
        let a = prompt(`Ваш любимый жанр под номером ${i+1}`, "");
        personalMovieDB.genres[i] = a;
    }
}



rememberMyFilms();
detectPersonalLevel();
showMyDB();
writeYourGenres();