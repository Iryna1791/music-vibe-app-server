const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Concert =  require('../models/Concert.model');
// const User = require('../models/User.model');
const Comment = require('../models/Comment.model');


router.post('/concerts', (req, res) => {
  const { title, imageUrl, address, description, comment } = req.body;

  Concert.create({ title, imageUrl, address, description, comment: [] })
  .then(response => res.json(response))
  .catch(err => res.json(err));
});

// GET /api/concerts -  Retrieves all of the concerts
router.get('/concerts', (req, res, next) => {
  Concert.find()
    .populate('comments')
    .then(allConcerts => res.json(allConcerts))
    .catch(err => res.json(err));
});

//  GET /api/concerts/:concertId -  Retrieves a specific project by id
router.get('/concerts/:concertId', (req, res, next) => {
  const { concertId } = req.params;
 
  if (!mongoose.Types.ObjectId.isValid(concertId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
 
  // Each Project document has a `tasks` array holding `_id`s of Task documents
  // We use .populate() method to get swap the `_id`s for the actual Task documents
  Concert.findById(concertId)
    .populate('comments')
    .then(concert => res.status(200).json(concert))
    .catch(error => res.json(error));
});

// PUT  /api/concerts/:concertId  -  Updates a specific project by id
router.put('/concerts/:concertId', (req, res, next) => {
  const { concertId } = req.params;
 
  if (!mongoose.Types.ObjectId.isValid(concertId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
 
  Concert.findByIdAndUpdate(concertId, req.body, { new: true })
    .then((updatedConcert) => res.json(updatedConcert))
    .catch(error => res.json(error));
});

// DELETE  /api/projects/:projectId  -  Deletes a specific project by id
router.delete('/concerts/:concertId', (req, res, next) => {
  const { concertId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(concertId)) {
    res.status(400).json({ message: 'Specified id is not valid' });
    return;
  }
 
  Concert.findByIdAndRemove(concertId)
    .then(() => res.json({ message: `Concert with ${concertId} is removed successfully.` }))
    .catch(error => res.json(error));
});



//COMMENT
router.get('/:id/comment', (req, res, next) => {

  const {id} = req.params

Concert.findById(id)

  .then(foundConcert => res.render('concerts/comment', foundConcert))
  .catch(err => console.log(err))

});

router.post('/:concertId/comment', (req, res, next) => {

  const {comment} = req.body
  console.log(comment)
  const userId = req.session.currentUser._id
  const {concertId} = req.params
  console.log("USER ID", userId)

  if (!comment) {
      res.render('/:id/comment', { errorMessage: 'Please write a comment before sending the form.' });
      return;
    }

    Comment.create({user: userId, comment})
      .then((newComment) => {
        console.log(concertId)
          Concert.findById(concertId)
          
              .then((commentedConcert) => {
                  commentedConcert.comments.push(newComment._id) 
                  commentedConcert.save()
              })
              .catch(err => console.log(err))
      })
      .then(() => res.redirect('/concerts'))
      .catch(err => console.log(err))

});



module.exports = router;