// const { fstat } = require('fs');
const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createThing = (req, res, next) => {
    const thingObject = JSON.parse(req.body.sauce);
    // delete thingObject._id;
    // delete thingObject._userId;
    const sauce = new Sauce({
      ...thingObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked: [' '],
      usersDisliked: [' ']
    });

    sauce.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !'})})
    .catch(error => { res.status(400).json({ error: error })})
}

exports.modifyThing = (req, res, next) => {
    const thingObject = req.gile ? {
      ...JSON.parse(req.body.thing),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete thingObject._userId;
    Sauce.findOne({_id: req.params.id})
    .then((thing) => {
      if (thing.userId != req.auth.userId) {
        res.status(400).json({ message : 'Non-autorisé' });
      } else {
        Sauce.updateOne({ _id: req.params.id}, { ...thingObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    })
};

exports.deleteThing = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
    .then(thing => {
      if (thing.userId != req.auth.userId) {
        res.status(401).json({ message: 'Non-autorisé' });
      } else {
        const filename = thing.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({_id: req.params.id})
          .then(() => { res.status(200).json({ message: 'Objet supprimé' })})
          .catch(error => res.status(401).json({ error }));
        })
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    })
};

exports.getOneThing = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(thing => res.status(200).json(thing))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllThings = (req, res, next) => {
  console.log("ok");
    Sauce.find()
    .then((sauces) => { res.status(200).json(sauces) })
    .catch(error => res.status(400).json({ error }));
};