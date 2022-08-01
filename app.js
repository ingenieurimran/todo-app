const express = require('express')
const ejs = require('ejs')
const bodyParser = require('body-parser')
const _ = require('lodash')
const mongoose = require('mongoose')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))
app.set('view engine', 'ejs')
// mongoose connecting
mongoose.connect('mongodb://localhost:27017/listtodoDB')
// Schema
const itemsSchema = mongoose.Schema({
  name: String,
})
const listsSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema],
})
// mongoose model
const Item = mongoose.model('Item', itemsSchema)
const List = mongoose.model('List', listsSchema)
// mongoose Documents
const item1 = new Item({
  name: 'Home',
})
const item2 = new Item({
  name: 'Leistungen',
})
// DefaultsDocumentsList
const defaultsDocumentsList = [item1, item2]
// Home Route
app.get('/', (req, res) => {
  Item.find({}, (err, itemsFounded) => {
    if (!err) {
      if (itemsFounded.length === 0) {
        // insert documents to db
        Item.insertMany(defaultsDocumentsList, (err, items) => {
          if (!err) {
            console.log('Successfully inserted documents to DB.')
          } else {
            console.log(err)
          }
        })
        res.redirect('/')
      } else {
        res.render('index', {
          listTitle: 'Ingenieurbüro Lieb',
          listItems: itemsFounded,
        })
      }
    } else {
      console.log(err)
    }
  })
})
// Route Parameters in Express
app.get('/:routeName', (req, res) => {
  const nameRoute = _.capitalize(req.params.routeName)

  List.findOne({ name: nameRoute }, (err, nameItemRoute) => {
    if (!err) {
      if (!nameItemRoute) {
        const lists = new List({
          name: nameRoute,
          items: defaultsDocumentsList,
        })
        lists.save()
        res.redirect('/' + nameRoute)
      } else {
        res.render('index', {
          listTitle: nameItemRoute.name,
          listItems: nameItemRoute.items,
        })
      }
    } else {
      console.log(err)
    }
  })
})
// post route
app.post('/', (req, res) => {
  const itemsInput = req.body.inputItems
  const routeTitle = req.body.title
  const itemNew = new Item({
    name: itemsInput,
  })
  if (routeTitle === 'Ingenieurbüro Lieb') {
    itemNew.save()
    res.redirect('/')
  } else {
    List.findOne({ name: routeTitle }, (err, titleRoute) => {
      if (!err) {
        titleRoute.items.push(itemNew)
        titleRoute.save()
        res.redirect('/' + routeTitle)
      } else {
        console.log(err)
      }
    })
  }
})
// delete pots route
app.post('/delete', (req, res) => {
  const checkedItem = req.body.checkBox
  const routeCheckBox = req.body.checkBoxRoute
  if (routeCheckBox === 'Ingenieurbüro Lieb') {
    Item.findByIdAndDelete(checkedItem, (err, itemChecked) => {
      if (!err) {
        console.log('Successfully deleted chicked item from DB Documensts.')
        res.redirect('/')
      } else {
        console.log(err)
      }
    })
  } else {
    List.findOneAndUpdate(
      { name: routeCheckBox },
      { $pull: { items: { _id: checkedItem } } },
      (err, listFoundDelete) => {
        if (!err) {
          res.redirect('/' + routeCheckBox)
        } else {
          console.log(err)
        }
      },
    )
  }
})
// port 3000 running server
app.listen(3000, () => {
  console.log('server is running on port 3000.')
})
