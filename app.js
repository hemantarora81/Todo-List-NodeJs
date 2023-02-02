const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js")



const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-hemant:mongodbadmin@cluster0.kfehq8l.mongodb.net/todolistDb", { useNewUrlParser: true });
// mongoose.set('strictQuery', false);

const itemsSchema = {
    name: String
};
const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
    name: "Buy Food"
});
const item2 = new Item({
    name: "Gym for two Hours"
});
const item3 = new Item({
    name: "Code for 2 Hours"
});
const defaultItem = [item1, item2, item3];


//For the custom TODOList 
const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) {

    Item.find({}, function (err, foundItems) {

        if (foundItems.length === 0) { //To check if array is empty or Not And if Empty then put some default items..
            Item.insertMany(defaultItem, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Sucessfully Inserted the Items to Db");
                }
            });
            res.redirect("/"); //To get back to the website
        } else {
            res.render("list", { listTitle: "Today", newListItems: foundItems });

        }

    })
});


//For the new TodoList Or Custom TODOLIST as per User
app.get("/:customListName", function (req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({ name: customListName }, function (err, foundList) {
        if (!err) {
            if (!foundList) {
                //Create a new List
                const list = new List({
                    name: customListName,
                    items: defaultItem
                });
                list.save();  //To save that into list collection
                res.redirect("/" + customListName);
            } else {
                //show an existing list
                res.render("list", { listTitle: foundList.name, newListItems: foundList.items })
            }
        }
    });



});



app.post("/", function (req, res) {


    const itemName = req.body.newItem; //Saving the item in itemName
    const listName = req.body.list; //To correspond to the name of the button in list.ejs
    const item = new Item({  //Creating the document for new item
        name: itemName
    });


    if (listName === "Today") {
        item.save(); // To save the Item in the Db
        res.redirect("/"); //To show the item to the Website


    } else {    //This is because when we add new item it will add to the custom List Name route


        List.findOne({ name: listName }, function (err, foundList) {  //he findOne() function is used to find one document according to the condition
            foundList.items.push(item); //To push the item in Items in the foundList.
            foundList.save();
            res.redirect("/" + listName);
        })
    }

});

app.post("/delete", function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function (err) {
            if (!err) {
                console.log("Successfully Removed");
                res.redirect("/");//To show to the Website
            }
        });
    } else {
        List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } }, function (err, foundList) { //{condition},{updates which means $pull:{},callback}
            if (!err) {
                res.redirect("/" + listName);
            }
        })
    }


});





app.get("/about", function (req, res) {
    res.render("about");
})


app.listen(3000, function () {
    console.log("Server is running on 3000 port");
});