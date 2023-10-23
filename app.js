//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to to yours to do list.",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  const getPage = async () => {
    try {
      const items = await Item.find({});
      if (items.length === 0) {
        Item.insertMany(defaultItems)
          .then()
          .then(console.log("Inserted succesfully"));
      }
      res.render("list", { listTitle: "Today", newListItems: items });
      // Process the retrieved items here
    } catch (err) {
      console.error("Error:", err);
    }
  };

  getPage();
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    const temp = async () => {
      try {
        const foundList = await List.findOne({ name: listName });

        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    temp();
  }
});

app.post("/delete", (req, res) => {
  const checkId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    console.log(checkId);
    Item.findByIdAndDelete(checkId).then(console.log("Item removed"));
    res.redirect("/");
  }
  else{
    const temp = async () => {
      try {
        const foundList = await List.findOneAndUpdate({ name: listName}, {$pull: {items: {_id: checkId}}});
        res.redirect("/" + listName);
      } catch (err) {
        console.error("Error:", err);
      }
    };

    temp();
  }
});

// Dynamic route
app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  // Inside an async function
  const temp = async () => {
    try {
      const isExist = await List.findOne({ name: customListName });

      if (isExist) {
        res.render("list", {
          listTitle: isExist.name,
          newListItems: isExist.items,
        });
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  temp();
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
