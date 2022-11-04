const express = require("express");
const bodyParser = require("body-parser");
const Account = require("../models/accountModel.js");
const Course = require("../models/courseModel.js");

const controller = {
    getIndex: function(req,res){
        res.render('index');
    },

    getLogin: function(req,res){
        res.render('login');
    },

    getRegister: function(req,res){
        res.render('register');
    },

    saveRegistration: function(req,res){
        const acc = new Account({
            fullName: {
                firstName: req.body.firstName,
                lastName: req.body.lastName
            },
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password
        });

        acc.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                res.render('registration', {
                    account: acc
                });
                console.log("Account added.");
            }
        });
    },

    viewFlowcharts: function(req,res){
        res.render('viewFlowcharts');
    },

    editFlowchart: function(req,res){
        res.render('editFlowchart');
    },

    createFlowchart: function(req,res){
        Course.find({}, function(err,rows){
            if(err){
                console.log(err);
            }
            else{
                res.render(('createFlowchart'), {
                    courses: rows
                });
            }
        });
    },

    addCourse: function(req,res){
        const course = new Course({
            code: req.body.code
        });
    
        course.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                
                res.redirect("/createflowchart");
                console.log("Course added.");
            }
        });
    },

    getProfile: function(req,res){
        res.render('userProfile');
    },

    getSettings: function(req,res){
        res.render('userSettings');
    },

    getHome: function(req,res){
        res.render('homepage');
    },

    //to update to a different .ejs later
    inviteFriends: function(req,res){
        res.render('searchResults');
    },

    searchResults: function(req,res){
        Account.find({
            $or: [{'fullName.firstName' : {$regex: new RegExp(req.body.query, 'i')}},
                  {'fullName.lastName' : {$regex: new RegExp(req.body.query, 'i')}}]
          }, function(err,query)
          {
            if(err){
                console.log(err);
            } else {
                res.render('searchResults',{
                    accounts: query
                });
            }
          });
        
    }
}

module.exports = controller;