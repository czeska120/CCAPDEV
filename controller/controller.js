const express = require("express");
const bodyParser = require("body-parser");
const Account = require("../models/accountModel.js");
const Flowchart = require("../models/flowchartModel.js");
const Course = require("../models/courseModel.js");
const { db } = require("../models/accountModel.js");
const { render } = require("ejs");
const { reset } = require("nodemon");
const addSamples = require("./sampleData.js")

//addSamples.sampleData();

const controller = {
// Registration and Login
    getIndex: function(req,res){
        res.render('index');
    },

    getLogin: function(req,res){
        console.log("getLogin");
        res.render('login', {
            loginError: ""
        });
    },

    verifyLogin: function(req,res){
        console.log("verifyLogin");
        Account.findOne({userName: req.body.username, password: req.body.password }, function (err, search) {
            if (err){
                console.log(err)
            }
            else if (search == null){// no result = wrong login 
                res.render('login', {loginError: "Wrong username/password"})
                console.log("No Result");
            } 
            else{
                req.session.isAuth = true;
                console.log("homepage");
                // set account deets here oki ?
                // req.session.anyVarName = whatever u want
                //ex. 
                req.session.userObjectId = search.id;
                req.session.userName = search.userName;
                req.session.email = search.email;
                res.redirect("/home");
            }
        });
    },

    getRegister: function(req,res){
        res.render('register',{
            registerError: ""
        });
    },

    saveRegistration: function(req,res){
        var firstName = req.body.firstName;
        var lastName = req.body.lastName;
        var userName = req.body.userName;
        var email= req.body.email;
        var password = req.body.password;
        var password2 = req.body.password2;

        //Validation for password add later
        if(password != password2){
            res.render('register', {
                registerError: "Passwords do not match."
            });
        } else{
            //Check if username and email is already taken
            Account.findOne({ userName: {"$regex": "^" + userName + "\\b", "$options": "i"}}, function (err, user) {
                Account.findOne({ email: {"$regex": "^" + email + "\\b", "$options": "i"}}, function (err, mail) {
                    if (user || mail) {
                        res.render('register', {
                            registerError: "Username/email already exists in database."
                        });
                        console.log("Same user/email.");
                    }else {
                        const acc = new Account({
                            fullName: {
                                firstName: firstName,
                                lastName: lastName
                            },
                            userName: userName,
                            email: email,
                            password: password
                        });
                        acc.save(function(err){
                            if(err){
                                console.log(err);
                            }
                            else{
                                res.redirect('/home');
                                console.log("Account added.");
                            }
                        });
                    }
                });
            });
        }
    },

    getHome: function(req,res){
        if (req.session.isAuth) {
            Account.findOne({_id: req.session.userObjectId, userName : req.session.userName }, function (err, search) {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("homepage");
                    res.render('homepage', {profile:search});
                }
            });
            
        }
        else {
            res.render('login', {loginError: "Please Login First"});
        }
    },

// Account Functions
    getMyProfile: function(req,res){
        Account.findById({_id: req.session.userObjectId}, function(err,result)
        {
          if(err){
              console.log(err);
          } else {
              res.render('userProfile',{
                  account: result
              });
          }
        });
    },

    getSettings: function(req,res){
        Account.findById({_id: req.session.userObjectId}, function(err,results)
        {
          if(err){
              console.log(err);
          } else {
              res.render('userSettings',{
                  accounts: results
              });
          }
        });
    },

    saveProfile:function(req,res){
        const image= req.file.filename
        Account.findByIdAndUpdate(req.session.userObjectId, 
            { 
            
                image:image,
            
            },                
            function (err, docs) {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Updated User : ", docs);
                }
        });
        res.redirect('/myprofile');

    },

    saveSettings: function(req,res){
        const lastName = req.body.lastName;
        const firstName = req.body.firstName;
        const bio = req.body.bio;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        Account.findByIdAndUpdate(req.session.userObjectId, 
            { 
                fullName:{
                    lastName: lastName,
                    firstName: firstName,
                }, 

                biography: bio,
                userName: username,
                email: email,
                password: password 
            },                
            function (err, docs) {
                if (err){
                    console.log(err)
                }
                else{
                    console.log("Updated User : ", docs);
                }
        });
        res.redirect('/myprofile');
    },
    
// Flowchart Functions
    viewFlowcharts: function(req,res){
        Flowchart.find({accountId: req.session.userObjectId}, function(err,query){
            if(err){
                console.log(err);
            } else {
                res.render('viewFlowcharts',{
                    flow: query
                });
            }
          });
    },

    createFlowchart: function(req,res){
        const flow = new Flowchart({
            accountId: req.session.userObjectId,
            title: req.body.flowchartName,
            department: req.body.deptName,
            startingYear: req.body.startAY,
            numberOfAY: 1
        });

        flow.save(function(err){
            if(err){
                console.log(err);
            }
            else{ 
                Flowchart.findOne({_id:  flow.id, accountId: req.session.userObjectId}, function(err,flow){
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("ETO YUNG FLOW GAGIIIIIIIIIII" +flow.id)
                        Course.find({flowchartId: flow.id}, function(err,rows){
                            if(err){
                                console.log(err);
                            }
                            else{
                                res.render(('createFlowchart'), {
                                    courses: rows,
                                    flowchart: flow
                                });
                            }
                        });
                    }
                })
                console.log("Flowchart created.");
            }
        });

       
    },

    editFlowchart: function(req,res){
       // editing flowchart
        if(req.params.flowchartId != undefined){
            console.log("Editing flowchart: req.params.flowchartId:" + req.params.flowchartId)
            console.log("Editing flowchart: req.params.userObjectId:" + req.session.userObjectId)
            Flowchart.findOne({_id:  req.params.flowchartId, accountId: req.session.userObjectId}, function(err,flow){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("ETO YUNG FLOW GAGIIIIIIIIIII" +flow)
                    Course.find({flowchartId: flow.id}, function(err,rows){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render(('editFlowchart'), {
                                courses: rows,
                                flowchart: flow
                            });
                        }
                    });
                }
            })
        }
        // creating flowchart
        else{ 

            const flow = new Flowchart({
                accountId: req.session.userObjectId,
                title: req.body.flowchartName,
                department: req.body.deptName,
                startingYear: req.body.startAY,
                numberOfAY: 1
            });
    
            flow.save(function(err){
                if(err){
                    console.log(err);
                }
                else{ 

            console.log("Creating flowchart: flow.id = " + flow.id)
            console.log("Creating flowchart: accountId = " + flow.accountId)
        
            Flowchart.findOne({_id: flow.id, accountId: flow.accountId}, function(err,flow){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("Newly created flowchart information:" + flow)
                    Course.find({flowchartId: flow.id}, function(err,rows){
                        if(err){
                            console.log(err);
                        }
                        else{
                            res.render(('editFlowchart'), {
                                courses: rows,
                                flowchart: flow
                            });
                        }
                    });
                }
            });
        }
    });
        }
    
    },
    
    saveFlowchart:function(req,res){
        res.redirect("/viewflowcharts");
        console.log("Flowchart added.");
    },

    deleteFlowchart: function(req,res){
        var id = req.params.flowchartId;
        Flowchart.findByIdAndDelete(id, function (err, docs) {
            if (err){
                console.log(err)
            }
            else{
                res.redirect("/viewflowcharts");
                console.log("flowchartid : ", id);
                console.log("Deleted : ", docs);
            }
        });
    },

    addAY: function(req, res){
        Flowchart.findByIdAndUpdate(req.params.id,
            {$inc: {numberOfAY: 1}},
            function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("AY CREATED")
                }
            }
        );
    },

// Course Functions
    addCourse: function(req,res){
        var statusString;
        var statusStyle;
        let statusId = Number(req.body.status);
        switch(statusId){
            case 1:  
                statusString = "Not Yet Taken";
                statusStyle = "#FFFFFF"
            break;
            case 2:  
                statusString = "Currently Taking";
                statusStyle = "#83BBE5"
            break;
            case 3:  
                statusString = "Passed";
                statusStyle = "#A3D977"
            break;
            case 4:  
                statusString = "Failed";
                statusStyle = "#FF6565"
            break;
            case 5:  
                statusString = "Dropped";
                statusStyle = "#FF6565"
            break;
            default: 
                statusString = "Not Yet Taken";
                statusStyle = "#fff"
        }
        const course = new Course({
            accountId: req.session.userObjectId,
            flowchartId: req.body.flowchartId,
            code: req.body.code,
            professor: req.body.prof,
            units: req.body.units,
            status: statusString,
            style: statusStyle,
            leftPosition: 0,
            topPosition: 0
        });
    
        course.save(function(err){
            if(err){
                console.log(err);
            }
            else{
                Flowchart .findOne({_id: req.body.flowchartId, accountId: req.session.userObjectId}, function(err,flow){
                    if(err){
                        console.log(err);
                    }
                    else{
                        Course.find({flowchartId: flow.id}, function(err,rows){
                            if(err){
                                console.log(err);
                            }
                            else{
                                res.render(('editFlowchart'), {
                                    courses: rows,
                                    flowchart: flow
                                });
                            }
                        });
                    }
                })
                console.log("Course added.");
            }
        });
    },

    editCourse: function(req,res){
        const courseId = req.params.courseId;
        Course.find({_id: courseId},function(err,result)
        {
            if(err){
                console.log(err);
            } else {
                res.render('editCourse',{
                    course : result[0]
                });
            }
        });
    },

    savePosition: function(req, res){
        const params = req.body.params
        const left = params.left;
        const top = params.top;
        const code = params.code;
        Course.findOneAndUpdate(
            {"code": code},
            {$set: {"leftPosition": left, "topPosition": top}},
            function(err){
                if(err){
                    console.log(err);
                } else {
                    console.log("Position Saved! LEFT:" + left + ", TOP: " + top + ", CODE:"+ code)
                }
            }
        )
    },

    updateChosen: function(req,res){
        const flowchartId = req.body.flowchartId;
        const courseId = req.body.codeId;
        const query = {_id : courseId};
        const code = req.body.code;
        const prof = req.body.prof;
        const units = req.body.units;

        var statusString;
        var statusStyle;
        let statusId = Number(req.body.status);
        switch(statusId){
            case 1:  
                statusString = "Not Yet Taken";
                statusStyle = "#FFFFFF"
            break;
            case 2:  
                statusString = "Currently Taking";
                statusStyle = "#83BBE5"
            break;
            case 3:  
                statusString = "Passed";
                statusStyle = "#A3D977"
            break;
            case 4:  
                statusString = "Failed";
                statusStyle = "#FF6565"
            break;
            case 5:  
                statusString = "Dropped";
                statusStyle = "#FF6565"
            break;
            default: 
                statusString = "Not Yet Taken";
                statusStyle = "#fff"
        }

        Course.updateOne(query, { code:code, professor:prof, units:units, status:statusString, style:statusStyle},
            function(err,result){
            if(err){
                console.log(err);
            }
            else{
                Flowchart.findOne({_id: flowchartId, accountId: req.session.userObjectId}, function(err,flow){
                    if(err){
                            console.log(err);
                    }
                    else{
                            console.log("ETO YUNG FLOW GAGIIIIIIIIIII" +flow.id)
                            Course.find({flowchartId: flow.id}, function(err,rows){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                        res.render(('editFlowchart'), {
                                            courses: rows,
                                            flowchart: flow
                                        });
                                        console.log("Course modified: " + result);
                                }
                            });
                    }
                });
            }
        });
    },

    deleteCourse: function(req,res){
        const courseId = req.params.courseId;
        Course.findByIdAndRemove(courseId, function(err,course){
            if(err){
                console.log(err);
            }else{
                Flowchart.findOne({_id: course.flowchartId, accountId: req.session.userObjectId}, function(err,flow){
                        if(err){
                            console.log(err);
                        }
                        else{
                            Course.find({flowchartId: flow.id}, function(err,rows){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                        res.render(('editFlowchart'), {
                                            courses: rows,
                                            flowchart: flow
                                        });
                                    }
                                });
                        }
                    });
            }
        })
    },

// Other Profile Functions
    getOtherProfile: function(req,res){
        const accountId = req.params.accountId;
        Account.find({_id: accountId},function(err,result)
        {
            if(err){
                console.log(err);
            } else {
                Flowchart.find({accountId: req.session.userObjectId}, function(err,query){
                    if(err){
                        console.log(err);
                    } else {
                    res.render('otherProfile',{
                        account : result[0],
                        flow: query
                        });
                    }
                });
            }
        });
    },

    viewUsers: function(req,res){
        Account.find({"_id": {$ne: req.session.userObjectId}}, function(err,results)
          {
            if(err){
                console.log(err);
            } else {
                res.render('viewUsers',{
                    accounts: results
                });
            }
          });
    },
    

    viewOtherFlowchart: function(req,res){
        Flowchart.findOne({_id: req.params.flowchartId}, function(err,query){
            if(err){
                console.log(err);
            } else {
                Course.find({flowchartId: query.id}, function(err,rows){
                    if(err){
                        console.log(err);
                    }
                    else{
                        res.render(('viewOtherFlowchart'), {
                            courses: rows,
                            flowchart: query
                        });
                    }
                });
            }
            });
        
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
    }, 

    logout: function(req,res){
        req.session.destroy();
        res.redirect("/");
    }, 
}

module.exports = controller;
