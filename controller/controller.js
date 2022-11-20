const express = require("express");
const bodyParser = require("body-parser");
const Account = require("../models/accountModel.js");
const Course = require("../models/courseModel.js");
const Flowchart = require("../models/flowchartModel.js");
const { db } = require("../models/accountModel.js");

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
        Flowchart.find({
            $or: [{'title' : {$regex: new RegExp(req.body.query, 'i')}}]
          }, function(err,query)
          {
            if(err){
                console.log(err);
            } else {
                res.render('viewFlowcharts',{
                    flow: query
                });
            }
          });
        
    },

    saveFlowchart:function(req,res){
        const flow = new Flowchart({
            title: req.body.title,
            department: req.body.department,
            acadYears: req.body.acadYears
        });

        flow.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/viewflowcharts");
        
                console.log("Flowchart added.");
            }
        });
    },
    deleteFlowchart: function(req,res){
        flowchartData= Flowchart.findByIdAndDelete(req.params.id);
        flowchartData.exec(function(err){
          if (err){
            console.log(err);
          }
          else{
               res.redirect('/viewflowcharts')
               console.log ("record was deleted");
            }
        });
           
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

    // editCourse: function(req, res){
    //     Courses.find({code: })
    // },

    getMyProfile: function(req,res){
       Account.findOne({}).sort({_id:-1}).exec(function(err,results){
        if(err){
            console.log(err);
        } else {
            res.render('userProfile',{
                accounts: results
            });
        }
       });

    },

    getSettings: function(req,res){
        Account.findOne({}).sort({_id:-1}).exec(function(err,results){
            if(err){
                console.log(err);
            } else {
                res.render('userSettings',{
                    accounts: results
                });
            }
           });
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
