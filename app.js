import express from 'express';
import bodyParser from "body-parser";
import ejs from 'ejs';
import multer from 'multer';
import path from 'path';


const app = express();
const port = 3000;

// Set up EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static("public"));

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: './public/uploads/', // specify the directory for storing uploaded files
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage
}).single('image'); // 'image' should match the name attribute of your file input field


// Parse URL-encoded bodies for form data
app.use(bodyParser.urlencoded({ extended: true }));

// Declare the posts array
let posts = [];
let postIdCounter = 1; // Initialize postIdCounter

// Display the home page
app.get("/", (req, res) =>{
    res.render('index.ejs', {posts: posts});
} );


// Create post request
app.post("/create-post", (req, res) => {
    // Middleware to handle file upload
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            // Handle error
            return;
        }

        // Extract data from the request
        const title = req.body.title;
        const content = req.body.content;
        const image = req.file ? req.file.filename : null; // Check if file exists before accessing filename

        // Generate a unique ID for the post
        const postId = postIdCounter++;

        // Create a new post object and add it to the array
        const newPost = { 
            id: postId, 
            title: title, 
            content: content,
            image: image // Add image field to the new post object 
        };

        // Push the new post to the array
        posts.push(newPost);

        // Redirect the user back to the home page
        res.redirect('/');
    });
});


// Display the edit form for a specific post
app.get('/edit-post/:postId', (req, res) => {
    const postId = parseInt(req.params.postId);
    // Find the post with the given ID (you may retrieve it from an array, database, etc.)
    const post = posts.find(post => post.id === postId);
    // Render the edit form template with the post data
    res.render('edit-post', { post: post });
});

// Handle post edit submission
app.post("/edit-post/:postId", (req, res) =>{
    const postId = parseInt(req.params.postId);
    const { title, content } = req.body;

     // Find the post with the given ID and update its data
     const postIndex = posts.findIndex(post => post.id === postId);
     if (postIndex !== -1) {
         posts[postIndex].title = title;
         posts[postIndex].content = content;
     }
     // Redirect the user back to the home page or display a success message
     res.redirect('/');
});

// Add a route to handle post deletion
app.post("/delete-post/:postId", (req, res) => {
    const postId = parseInt(req.params.postId);
    
    // Find the index of the post with the given ID
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
        // Remove the post from the array
        posts.splice(postIndex, 1);
    }
    
    // Redirect the user back to the home page
    res.redirect('/');
});


let tasks = ["Bathing", "Shoping", "clean room", "Read Bible"];
// Display the alternative list
app.get("/alternative-list", (req, res) => {
    // Assuming you have another array called alternativeTasks containing alternative tasks
    const alternativeTasks = tasks; // Replace this with your actual alternative tasks array
    res.render("alternative-list", { alternativeTasks: alternativeTasks });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(port, () =>  {
    console.log(`Listeing on port ${port}`);
});