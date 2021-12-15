const express = require('express')
const User = require('../models/users')
const Message = require('../models/message')

const new_message_get = (req, res) => {
    if(req.user) {
        res.render('new-message', {user: req.user})
    } else {
        res.redirect('/log-in')
    }
}

const new_message_post = (req, res) => {
    const message = new Message({
        title: req.body.title,
        message: req.body.message,
        author: req.user.username
    })

    message.save()
    .then(result => res.redirect('/'))
    .catch(err => console.log(err))
}

const become_member_get = (req, res) => {
    if(req.user) {
        res.render('member', {user: req.user, alerts: []})
    } else {
        res.redirect('/log-in')
    }
}

const become_member_post = (req, res) => {
    if(req.user) {
        if(req.body.memberPassword == process.env.MEMBER_PASSWORD) {
            User.updateOne({username: req.user.username}, {
                $set: {"member": true}
            })
            .then(result => res.render('member', {user: req.user, alerts: [{msg: "You are now a member"}]}))
            .catch(err => console.log(err))
            
        } else {
            res.render('member', {user: req.user, alerts: [{msg: "Wrong Password! Please try again"}]})
        }
    } else {
        res.redirect('/log-in')
    }
}

const become_admin_get = (req, res) => {
    if(req.user) {
        res.render('admin', {user: req.user, alerts: []})
    } else {
        res.redirect('/log-in')
    }
}

const become_admin_post = (req, res) => {
    if(req.user) {
        if(req.body.adminPassword == process.env.ADMIN_PASSWORD) {
            User.updateOne({username: req.user.username}, {
                $set: {"admin": true}
            })
            .then(result => res.render('admin', {user: req.user, alerts: [{msg: "you are now an admin"}]}))
            .catch(err => console.log(err))
        } else {
            res.render('admin', {user: req.user, alerts: [{msg: "wrong password! please try again"}]})
        } 
    } else {
        res.redirect('/log-in')
    }
}

module.exports = {
    new_message_get,
    new_message_post,
    become_member_get,
    become_member_post,
    become_admin_get,
    become_admin_post,
}