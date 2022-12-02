import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-firestore.js"
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js"
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js"


const firebaseConfig = {
    apiKey: "AIzaSyBtKwXTAw5AOdYb28Bg40h4CMhtkJ1ipuA",
    authDomain: "instagram-clone-aa227.firebaseapp.com",
    projectId: "instagram-clone-aa227",
    storageBucket: "instagram-clone-aa227.appspot.com",
    messagingSenderId: "1091522276714",
    appId: "1:1091522276714:web:3d0d27d7d4a3e38a644913"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

let mail;
let userName;


//Asignar nombre de usuario a los usuarios y otros datos;
onAuthStateChanged(auth, (user) => {
    if (user) {
        
        mail = user.email;
        if (mail) {
            userName = mail.split('@')[0];
            console.log(userName);
        }

        let user_name = document.getElementById("create-user-name");
        if (user_name) {

            user_name.innerText = userName;
        }

    } else {
        // ...
        
    }
});

//Log out

let logOutButton = document.getElementById("log-out-button");
if (logOutButton) {
    logOutButton.addEventListener('click', (e) => { 
        logOut(e);
    })
}
 
function logOut(e) {
    e.preventDefault();
    signOut(auth)
        .then(() => {
            console.log('Log Out succesfully');
            window.location.href = "../";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // ..
        });
}

//Register 
let buttonRegister = document.getElementById('register-button');
if (buttonRegister) { 
    buttonRegister.addEventListener('click', (e) => register(e));

    function register(e) {
        e.preventDefault();
        let user = [{ email: "" }, { password: "" }]

        user.email = document.getElementById('registerEmail')?.value;
        user.password = document.getElementById('registerPassword')?.value;

        //Call firebase function 
        newUser(user.email, user.password);

        document.getElementById('registerEmail').value = "";
        document.getElementById('registerPassword').value = "";
        document.getElementById('registerUser').value = "";
        document.getElementById('registerName').value = "";
    }

    function newUser(email, password) {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log(user)
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                // ..
            });
    }
}


//Log in

let buttonSignIn = document.getElementById('sign-in-button');
if (buttonSignIn) { 
    buttonSignIn.addEventListener('click', (e) => logIn(e));

    function logIn(e) {
        e.preventDefault();
        let user = [{ email: "" }, { password: "" }]

      
        user.email = document.getElementById('loginName')?.value;
        user.password = document.getElementById('loginPassword')?.value;


        singInUser(user.email, user.password);
    }


    function singInUser(email, password) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 

                const user = userCredential.user;
                console.log("Log in succesfull");
                window.location.href = "../FINAL_DCA/main";

                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log("Log in error: ", errorCode, errorMessage)
            });
    }
}


//Create a post

const imgRoute = 'post-imgs';
let postUser = userName;
let postLocation = document.getElementById('create-location');
let postDescription = document.getElementById('create-description');
let postButton = document.getElementById('create-button');

if (postButton) {
    postButton.addEventListener('click', () => {
        addPost();
    })
    
}

//Put post
let post;

function formatPost() {
    try {
        post = {
            name: postUser,
            location: postLocation.value,
            description: postDescription.value,
        }
    } catch (e) {
        console.error("Error adding post")
    }
}

//Add new post
async function addPost() {
    try {
        formatPost();
       
        const imgInput = document.getElementById('create-img').files[0];

        const uploadedFileUrl = await addImage(imgInput.name, imgInput);
        
        console.log(post)

        const docRef = await addDoc(collection(db, "posts"), {
            name: userName || null,
            location: post.location || null,
            description: post.description || null,            
            imgUrl: uploadedFileUrl || null
        });

        postLocation.value = '';
        postDescription.value = '';
        let succedInd = document.getElementById('post-success');
        if (succedInd) {
            succedInd.style.display = 'block';
        }
        window.location.href = "../main/index.html";

        console.log("Document written with name:", docRef.id)

    } catch (e) {
        console.error("Error adding document", e)
    }
}

//Add img file
async function addImage(name, file) {

    const storageRef = ref(storage, `${imgRoute}/${name}`);

    try {
        await uploadBytes(storageRef, file)
        console.log(file)
        const url = await getDownloadURL(storageRef);
        return url
    } catch (err) {
        console.error("Error uploading img: " + err.message)
    }

}

// Draw post

export async function getAllPosts() {
    const querySnapshot = await getDocs(collection(db, "posts"));
    const mappedArray = [];
    querySnapshot.forEach((doc) => {
        // console.log(doc.id, " => ", doc.data());
        mappedArray.push(doc.data());
    });

    return mappedArray;
}

let allPosts = await getAllPosts();
console.log(allPosts)

displayPost();

function displayPost() {

    const postSection = document.getElementById('post-container');
    if (postSection) { 
        postSection.innerHTML = '';
        
        allPosts.forEach(postInfo => {
            const post = document.createElement('div');
            post.className = `post`;
            post.innerHTML = `<div class="post-header">
                    <img src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" alt="">
           
                        <div class="post-user-info">
                            <span> ${postInfo.name} </span>
                            <p>${postInfo.location}</p>
                        </div>
                    </div>

                    <div class="post-main-image">
                        <img src="${postInfo.imgUrl}" alt="">
                    </div>
                    
                    <div class="post-description">
                        <div class="feed-interactions">
                            <img src="../assets/feed-interactions.JPG" alt="">
                        </div>
                        <div class="main-description">
                            <span> 243 Me gusta </span>
                            <p> <span> ${postInfo.name} </span>  ${postInfo.description}</p>
                        </div>
                        <div class="description-info">
                            <p> Ver más comentarios...</p>
                            <span> HACE UNOS SEGUNDOS</span>
                            <img src="../assets/make-comment.JPG" alt="">
                        </div>
                    </div>
                </div>`

            postSection.append(post);
        })
    }

    
}