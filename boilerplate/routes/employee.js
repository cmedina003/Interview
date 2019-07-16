'use strict';

const express = require('express');
const uuidv4 = require('uuid/v4');
const axios = require('axios');
const moment = require('moment');
const router = express.Router();

const Roles = {
    CEO : "CEO",
    VP : "VP",
    MANAGER : "MANAGER",
    LACKEY : "LACKEY"
}

const DATABASE = {
  employees : []
};

/* GET employees listing. */
router.get('', (req, res) => res.send(DATABASE.employees));

/* GET employee record */
router.get('/:id', (req, res) => res.send(DATABASE.employees.find( employee => employee.id == req.params.id)));

/* POST employee record */
router.post('', (req, res) => {
    let entry = {
        "id": uuidv4(),
        "firstName": isValidString(req.body.firstName),
        "lastName": isValidString(req.body.lastName),
        "role": getRole(req.body.role),
        "hireDate": getDate(req.body.hireDate)
    }
    axios.all([
        axios.get("https://ron-swanson-quotes.herokuapp.com/v2/quotes"),
        axios.get("https://quotes.rest/qod")
        ]).then(axios.spread((response1, response2) => {
            entry["quote1"] = response1.data[0];
            entry["quote2"] = response2.data.contents.quotes[0].quote;
        DATABASE.employees.push(entry);
        res.send(entry);
    })).catch( error => {
        res.send(error);
    });
});

/* PUT employee record */
router.put("/:id", (req, res) => {
    var index = DATABASE.employees.findIndex(employee => req.params.id == employee.id);
    if(index > -1) {
        let entry = {
            "id": isValidString(req.params.id),
            "firstName": isValidString(req.body.firstName),
            "lastName": isValidString(req.body.lastName),
            "role": getRole(req.body.role),
            "hireDate": getDate(req.body.hireDate),
            "quote1": isValidString(req.body.quote1),
            "quote2": isValidString(req.body.quote2)
        }
        DATABASE.employees[index] = entry;
        res.send(entry);
    }
});



/* DELETE employee record */
router.delete("/:id", (req, res) => {
    var index = DATABASE.employees.findIndex(employee => req.params.id == employee.id);
    if(index > -1) {
        DATABASE.employees.splice(index, 1);
    }
    res.send(DATABASE.employees);
});


/**
 *   utility function for checking validity of arguments passed in for string fields
 *
 * @param value
 * @returns {string}
 */
function isValidString(value) {
    if(typeof value != "string") {
        throw new Error("Illegal Argument: invalid string argument was provided");
    }
    return new String(value);
}

/**
 *  checks validity of the provided role argument.
 *  Checks for string type and whether the provided
 *  role is one of the permissible values.
 *
 * @param role
 * @returns {string}
 */
function getRole(role) {
    switch (isValidString(role).toUpperCase()) {
        case Roles.CEO:
            return Roles.CEO;
        case Roles.LACKEY:
            return Roles.LACKEY;
        case Roles.MANAGER:
            return Roles.MANAGER;
        case Roles.VP:
            return Roles.VP;
        default:
            throw new Error("Illegal Argument: invalid employee role was provided");
    }
}

/**
 *  parses the argument into a formatted date
 *  Checks the validity of the format and whether
 *  it is a past date
 *
 * @param rawDate
 * @returns {*|moment.Moment}
 */
function getDate(rawDate) {
    var date =  moment(rawDate, 'YYYY-MM-DD');

    if(!date.isValid()) {
        throw new Error("Illegal Argument: invalid format of hireDate")
    }

    if(date.isAfter(moment())) {
        throw new Error("Illegal Argument: date object must be in the past");
    }
    return date;
}

module.exports = router;
